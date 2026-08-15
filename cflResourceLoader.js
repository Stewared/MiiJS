import * as fs from 'fs';

const textureBytesPerPixel = {
    0x00: 4,
    0x01: 3,
    0x02: 0.5,
    0x03: 2,
    0x04: 1,
    0x05: 2,
    0x07: 1,
    0x08: 1,
    0x09: 1,
    0x0a: 2
};

const cflRecordOffsetMask = 0x000fffff;

function signedByte(value) {
    return value > 0x7f ? value - 0x100 : value;
}

function decodeCompactCoordinate(bytes, offset) {
    return signedByte(bytes[offset + 1]) + bytes[offset] / 256;
}

function decodeCompactNormal(bytes, offset) {
    const value = decodeCompactCoordinate(bytes, offset) / 64;
    return Number.isFinite(value) ? value : 0;
}

function normalizeVector(vector) {
    const length = Math.hypot(vector[0], vector[1], vector[2]);
    if (length <= 1e-6) return [0, 0, 1];
    return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function expand4(value) {
    return (value & 0x0f) * 0x11;
}

function expand5(value) {
    return ((value & 0x1f) << 3) | ((value & 0x1f) >> 2);
}

function expand6(value) {
    return ((value & 0x3f) << 2) | ((value & 0x3f) >> 4);
}

function readPixel(bytes, view, format, offset) {
    if (format === 0x00) return [bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]];
    if (format === 0x01) return [bytes[offset], bytes[offset + 1], bytes[offset + 2], 255];
    if (format === 0x02) {
        const value = view.getUint16(offset, true);
        return [expand5(value >> 11), expand5(value >> 6), expand5(value >> 1), (value & 1) ? 255 : 0];
    }
    if (format === 0x03) {
        const value = view.getUint16(offset, true);
        return [expand5(value >> 11), expand6(value >> 5), expand5(value), 255];
    }
    if (format === 0x04) {
        const value = bytes[offset];
        const frame = 255 - expand4(value & 0x0f);
        return [frame, 255, 255, frame];
    }
    if (format === 0x05) {
        const l = bytes[offset];
        const a = bytes[offset + 1];
        return [l, l, l, a];
    }
    if (format === 0x07) {
        const l = bytes[offset];
        return [l, l, l, 255];
    }
    if (format === 0x08) return [255, 255, 255, bytes[offset]];
    if (format === 0x09) {
        const value = bytes[offset];
        const l = expand4(value >> 4);
        return [l, l, l, expand4(value)];
    }
    if (format === 0x0a) {
        const value = view.getUint16(offset, true);
        return [expand4(value >> 12), expand4(value >> 8), expand4(value >> 4), expand4(value)];
    }
    return [255, 255, 255, 0];
}

function nextPowerOfTwo(value) {
    let out = 1;
    while (out < value) out <<= 1;
    return out;
}

function getTiledStorageDimensions(width, height, payloadBytes, bytesPerPixel) {
    const pixelCount = Math.floor(payloadBytes / bytesPerPixel);
    let storageWidth = Math.max(8, nextPowerOfTwo(width));
    let storageHeight = Math.max(8, Math.ceil(pixelCount / storageWidth));

    if (storageWidth < 64 && storageHeight > nextPowerOfTwo(height)) {
        const squareHeight = pixelCount / 64;
        if (Number.isInteger(squareHeight) && squareHeight >= height && squareHeight % 8 === 0) {
            storageWidth = 64;
            storageHeight = squareHeight;
        }
    }

    return {
        storageWidth: Math.ceil(storageWidth / 8) * 8,
        storageHeight: Math.ceil(storageHeight / 8) * 8
    };
}

function readCflMaskPixel(bytes, format, tileSrc, pixelInTile) {
    if (format === 0x02) {
        const packed = bytes[tileSrc + (pixelInTile >> 1)];
        const value = (pixelInTile & 1) ? (packed >> 4) : (packed & 0x0f);
        const l = expand4(value);
        return [l, l, l, l];
    }
    if (format === 0x0a) {
        const offset = tileSrc + pixelInTile * 2;
        const value = bytes[offset] | (bytes[offset + 1] << 8);
        return [expand4(value >> 12), expand4(value >> 8), expand4(value >> 4), expand4(value)];
    }
    return null;
}

function decodeTextureRecord(bytes, view, offset, recordEnd = null) {
    const width = view.getUint16(offset, true);
    const height = view.getUint16(offset + 2, true);
    const format = bytes[offset + 5];
    const bytesPerPixel = textureBytesPerPixel[format];
    if (!width || !height || !bytesPerPixel) return null;

    const payloadBytes = (recordEnd ?? bytes.length) - offset - 8;
    const storage = (format === 0x02 || format === 0x0a)
        ? getTiledStorageDimensions(width, height, payloadBytes, bytesPerPixel)
        : { storageWidth: width, storageHeight: height };
    const rgba = new Uint8Array(width * height * 4);
    let src = offset + 8;
    for (let tileY = 0; tileY < storage.storageHeight; tileY += 8) {
        for (let tileX = 0; tileX < storage.storageWidth; tileX += 8) {
            const tileSrc = src;
            for (let morton = 0; morton < 64; morton++) {
                let x = 0;
                let y = 0;
                for (let bit = 0; bit < 3; bit++) {
                    x |= ((morton >> (bit * 2)) & 1) << bit;
                    y |= ((morton >> (bit * 2 + 1)) & 1) << bit;
                }

                const dstX = tileX + x;
                const dstY = tileY + y;
                const pixel = readCflMaskPixel(bytes, format, tileSrc, morton) ?? readPixel(bytes, view, format, src);
                if (format !== 0x02) src += bytesPerPixel;
                if (dstX >= width || dstY >= height) continue;

                const dst = (dstY * width + dstX) * 4;
                rgba[dst + 0] = pixel[0];
                rgba[dst + 1] = pixel[1];
                rgba[dst + 2] = pixel[2];
                rgba[dst + 3] = pixel[3];
            }
            if (format === 0x02) src += 32;
        }
    }

    return { width, height, rgba, format };
}

export function parseCflResource(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const headerSize = view.getUint32(4, true);
    const offsets = [];
    for (let offset = 4; offset < headerSize; offset += 4) {
        offsets.push(view.getUint32(offset, true));
    }
    return { bytes, view, offsets };
}

export async function loadCflResourceFromFS(path) {
    return parseCflResource(await fs.promises.readFile(path));
}

function getCflRecordOffset(resource, sectionIndex, itemIndex) {
    const section = resource?.offsets?.[sectionIndex];
    if (!section) return null;

    const count = resource.view.getUint16(section, true);
    if (!count) return null;

    const index = Math.max(0, Math.min(count - 1, itemIndex | 0));
    const tableOffset = section + 4 + index * 4;
    const recordsBase = section + 8 + count * 4;
    const relativeOffset = resource.view.getUint32(tableOffset, true) & cflRecordOffsetMask;
    return recordsBase + relativeOffset;
}

function getCflRecordEnd(resource, sectionIndex, itemIndex) {
    const section = resource?.offsets?.[sectionIndex];
    if (!section) return resource?.bytes?.length ?? 0;

    const count = resource.view.getUint16(section, true);
    if (!count) return resource.bytes.length;

    const index = Math.max(0, Math.min(count - 1, itemIndex | 0));
    const recordsBase = section + 8 + count * 4;
    if (index + 1 < count) {
        return recordsBase + (resource.view.getUint32(section + 4 + (index + 1) * 4, true) & cflRecordOffsetMask);
    }
    return recordsBase + resource.view.getUint32(section + 4 + count * 4, true);
}

function findCflModelDataOffset(resource, recordOffset, recordEnd) {
    for (let localOffset = 0; localOffset <= Math.min(0x80, recordEnd - recordOffset - 8); localOffset += 2) {
        const offset = recordOffset + localOffset;
        const vertexCount = resource.view.getUint16(offset, true);
        const normalCount = resource.view.getUint16(offset + 2, true);
        const uvCount = resource.view.getUint16(offset + 4, true);
        const drawCommandCount = resource.view.getUint16(offset + 6, true);
        if (vertexCount < 3 || vertexCount > 512 || normalCount < 1 || normalCount > 512 ||
            uvCount > 512 || drawCommandCount < 1 || drawCommandCount > 32) {
            continue;
        }

        let commandOffset = offset + 8 + vertexCount * 6 + normalCount * 6 + uvCount * 4;
        let valid = true;
        for (let command = 0; command < drawCommandCount; command++) {
            if (commandOffset + 4 > recordEnd) {
                valid = false;
                break;
            }
            const primitive = resource.view.getUint16(commandOffset, true);
            const byteLength = resource.view.getUint16(commandOffset + 2, true);
            if (primitive !== 4 || byteLength < 3 || commandOffset + 4 + byteLength > recordEnd) {
                valid = false;
                break;
            }
            commandOffset += 4 + byteLength + (byteLength & 1);
        }
        if (valid) return localOffset;
    }
    return 0;
}

export function decodeCflTexture(resource, sectionIndex, itemIndex) {
    const recordOffset = getCflRecordOffset(resource, sectionIndex, itemIndex);
    if (recordOffset == null) return null;
    return decodeTextureRecord(resource.bytes, resource.view, recordOffset, getCflRecordEnd(resource, sectionIndex, itemIndex));
}

export function decodeCflModel(resource, sectionIndex, itemIndex, modelDataOffset = null) {
    const recordOffset = getCflRecordOffset(resource, sectionIndex, itemIndex);
    if (recordOffset == null || recordOffset + 8 > resource.bytes.length) return null;

    const recordEnd = getCflRecordEnd(resource, sectionIndex, itemIndex);
    const localModelOffset = modelDataOffset ?? findCflModelDataOffset(resource, recordOffset, recordEnd);
    const offset = recordOffset + localModelOffset;
    if (offset + 8 > recordEnd) return null;

    const view = resource.view;
    const vertexCount = view.getUint16(offset, true);
    const normalCount = view.getUint16(offset + 2, true);
    const uvCount = view.getUint16(offset + 4, true);
    const drawCommandCount = view.getUint16(offset + 6, true);
    if (!vertexCount || vertexCount > 1024 || normalCount > 1024 || uvCount > 1024 || drawCommandCount > 64) {
        return null;
    }

    const rawVertices = [];
    const rawNormals = [];
    const rawUvs = [];
    let cursor = offset + 8;

    const isInterleavedVertexRecord = normalCount === vertexCount && (uvCount === 0 || uvCount === vertexCount);
    if (isInterleavedVertexRecord) {
        const stride = 6 + 6 + (uvCount ? 4 : 0);
        if (cursor + vertexCount * stride > recordEnd) return null;
        for (let i = 0; i < vertexCount; i++) {
            rawVertices.push([
                decodeCompactCoordinate(resource.bytes, cursor),
                decodeCompactCoordinate(resource.bytes, cursor + 2),
                decodeCompactCoordinate(resource.bytes, cursor + 4)
            ]);
            cursor += 6;
            rawNormals.push(normalizeVector([
                decodeCompactNormal(resource.bytes, cursor),
                decodeCompactNormal(resource.bytes, cursor + 2),
                decodeCompactNormal(resource.bytes, cursor + 4)
            ]));
            cursor += 6;
            if (uvCount) {
                rawUvs.push([
                    view.getInt16(cursor, true) / 8192,
                    1 - view.getInt16(cursor + 2, true) / 8192
                ]);
                cursor += 4;
            }
        }
    }
    else {
        if (cursor + vertexCount * 6 > recordEnd) return null;
        for (let i = 0; i < vertexCount; i++) {
            const x = decodeCompactCoordinate(resource.bytes, cursor);
            const y = decodeCompactCoordinate(resource.bytes, cursor + 2);
            const z = decodeCompactCoordinate(resource.bytes, cursor + 4);
            rawVertices.push([x, y, z]);
            cursor += 6;
        }

        if (cursor + normalCount * 6 > recordEnd) return null;
        for (let i = 0; i < normalCount; i++) {
            const x = decodeCompactNormal(resource.bytes, cursor);
            const y = decodeCompactNormal(resource.bytes, cursor + 2);
            const z = decodeCompactNormal(resource.bytes, cursor + 4);
            rawNormals.push(normalizeVector([x, y, z]));
            cursor += 6;
        }

        if (cursor + uvCount * 4 > recordEnd) return null;
        for (let i = 0; i < uvCount; i++) {
            const u = view.getInt16(cursor, true) / 8192;
            const v = 1 - view.getInt16(cursor + 2, true) / 8192;
            rawUvs.push([u, v]);
            cursor += 4;
        }
    }

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const indexMap = new Map();
    const hasUvs = uvCount > 0;
    const getVertexIndex = (vertexIndex) => {
        if (vertexIndex >= rawVertices.length) return null;

        const normalIndex = normalCount === 1 ? 0 : Math.min(vertexIndex, normalCount - 1);
        const uvIndex = hasUvs ? Math.min(vertexIndex, uvCount - 1) : -1;
        const key = `${vertexIndex}/${normalIndex}/${uvIndex}`;
        const existing = indexMap.get(key);
        if (existing != null) return existing;

        const nextIndex = vertices.length;
        vertices.push(rawVertices[vertexIndex]);
        normals.push(rawNormals[normalIndex] ?? [0, 0, 1]);
        if (hasUvs) uvs.push(rawUvs[uvIndex] ?? [0, 0]);
        indexMap.set(key, nextIndex);
        return nextIndex;
    };

    for (let command = 0; command < drawCommandCount; command++) {
        if (cursor + 4 > recordEnd) return null;
        const primitive = view.getUint16(cursor, true);
        const byteLength = view.getUint16(cursor + 2, true);
        cursor += 4;
        if (cursor + byteLength > recordEnd) return null;

        if (primitive === 4) {
            const commandIndices = [];
            for (let i = 0; i < byteLength; i++) {
                const vertexIndex = resource.bytes[cursor + i];
                const index = getVertexIndex(vertexIndex);
                if (index != null) commandIndices.push(index);
            }

            for (let i = 0; i + 2 < commandIndices.length; i += 3) {
                const a = commandIndices[i];
                const b = commandIndices[i + 1];
                const c = commandIndices[i + 2];
                if (a !== b && b !== c && a !== c) {
                    indices.push(a, b, c);
                }
            }
        }
        cursor += byteLength + (byteLength & 1);
    }

    if (!indices.length) return null;

    const transform = {};
    if (localModelOffset >= 0x24) {
        transform.hairPosition = [
            view.getFloat32(recordOffset + 0x00, true),
            view.getFloat32(recordOffset + 0x04, true),
            view.getFloat32(recordOffset + 0x08, true)
        ];
        transform.faceCenterPosition = [
            view.getFloat32(recordOffset + 0x0c, true),
            view.getFloat32(recordOffset + 0x10, true),
            view.getFloat32(recordOffset + 0x14, true)
        ];
        transform.beardPosition = [
            view.getFloat32(recordOffset + 0x18, true),
            view.getFloat32(recordOffset + 0x1c, true),
            view.getFloat32(recordOffset + 0x20, true)
        ];
    }
    if (localModelOffset >= 0x48) {
        transform.hairTransforms = [];
        for (let i = 0; i < 6; i++) {
            const vecOffset = recordOffset + i * 12;
            transform.hairTransforms.push([
                view.getFloat32(vecOffset, true),
                view.getFloat32(vecOffset + 4, true),
                view.getFloat32(vecOffset + 8, true)
            ]);
        }
    }

    return { vertices, normals, uvs, indices, transform, modelDataOffset: localModelOffset };
}

export function createCflModelMesh(THREE, decoded, material) {
    if (!decoded) return null;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(decoded.vertices.length * 3);
    for (let i = 0; i < decoded.vertices.length; i++) {
        positions[i * 3 + 0] = decoded.vertices[i][0];
        positions[i * 3 + 1] = decoded.vertices[i][1];
        positions[i * 3 + 2] = decoded.vertices[i][2];
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    if (decoded.normals.length >= decoded.vertices.length) {
        const normals = new Float32Array(decoded.vertices.length * 3);
        for (let i = 0; i < decoded.vertices.length; i++) {
            normals[i * 3 + 0] = decoded.normals[i][0];
            normals[i * 3 + 1] = decoded.normals[i][1];
            normals[i * 3 + 2] = decoded.normals[i][2];
        }
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    }

    if (decoded.uvs.length >= decoded.vertices.length) {
        const uvs = new Float32Array(decoded.vertices.length * 2);
        for (let i = 0; i < decoded.vertices.length; i++) {
            uvs[i * 2 + 0] = decoded.uvs[i][0];
            uvs[i * 2 + 1] = decoded.uvs[i][1];
        }
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }

    const IndexArray = decoded.vertices.length > 65535 ? Uint32Array : Uint16Array;
    geometry.setIndex(new THREE.BufferAttribute(new IndexArray(decoded.indices), 1));
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    return mesh;
}

export function createCflFeatureTexture(THREE, resource, sectionIndex, itemIndex, color = 0x111111) {
    const decoded = decodeCflTexture(resource, sectionIndex, itemIndex);
    if (!decoded) return null;

    const tint = new THREE.Color(color);
    const out = new Uint8Array(decoded.width * decoded.height * 4);
    for (let i = 0; i < decoded.rgba.length; i += 4) {
        const rgbAlpha = Math.max(decoded.rgba[i], decoded.rgba[i + 1], decoded.rgba[i + 2]);
        const alpha = decoded.format === 0x00 || decoded.format === 0x02 ||
            decoded.format === 0x04 || decoded.format === 0x05 ||
            decoded.format === 0x08 || decoded.format === 0x09 ||
            decoded.format === 0x0a
            ? Math.min(decoded.rgba[i + 3], rgbAlpha || decoded.rgba[i + 3])
            : rgbAlpha;
        out[i + 0] = Math.round(tint.r * 255);
        out[i + 1] = Math.round(tint.g * 255);
        out[i + 2] = Math.round(tint.b * 255);
        out[i + 3] = alpha;
    }

    const texture = new THREE.DataTexture(out, decoded.width, decoded.height, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}
