import * as fs from 'fs';

class CgfxReader {
    constructor(bytes) {
        this.bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        this.view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength);
    }

    u8(offset) { return this.view.getUint8(offset); }
    i8(offset) { return this.view.getInt8(offset); }
    u16(offset) { return this.view.getUint16(offset, true); }
    i16(offset) { return this.view.getInt16(offset, true); }
    u32(offset) { return this.view.getUint32(offset, true); }
    i32(offset) { return this.view.getInt32(offset, true); }
    f32(offset) { return this.view.getFloat32(offset, true); }

    magic(offset, magic) {
        if (offset < 0 || offset + magic.length > this.bytes.length) return false;
        for (let i = 0; i < magic.length; i++) {
            if (this.bytes[offset + i] !== magic.charCodeAt(i)) return false;
        }
        return true;
    }

    rel(fieldOffset) {
        const offset = this.i32(fieldOffset);
        return offset ? fieldOffset + offset : 0;
    }

    string(offset) {
        let out = '';
        for (let pos = offset; pos < this.bytes.length && this.bytes[pos] !== 0; pos++) {
            const c = this.bytes[pos];
            if (c < 0x20 || c > 0x7e) break;
            out += String.fromCharCode(c);
        }
        return out;
    }
}

function parseDict(reader, offset) {
    if (!offset || !reader.magic(offset, 'DICT')) return [];
    const count = reader.u32(offset + 0x08);
    const entries = [];
    for (let i = 0; i < count; i++) {
        const entry = offset + 0x1c + i * 0x10;
        entries.push({
            name: reader.string(reader.rel(entry + 0x08)),
            object: reader.rel(entry + 0x0c)
        });
    }
    return entries;
}

function parseDataDicts(reader) {
    if (!reader.magic(0, 'CGFX')) throw new Error('Not a CGFX file.');
    const dataOffset = 0x14;
    if (!reader.magic(dataOffset, 'DATA')) throw new Error('CGFX DATA block is missing.');

    const dicts = [];
    for (let i = 0; i < 16; i++) {
        const count = reader.u32(dataOffset + 0x08 + i * 8);
        if (!count) {
            dicts[i] = [];
            continue;
        }
        dicts[i] = parseDict(reader, reader.rel(dataOffset + 0x0c + i * 8));
    }
    return dicts;
}

function readComponentValue(reader, offset, dataType) {
    switch (dataType) {
        case 0: return reader.i8(offset);
        case 1: return reader.u8(offset);
        case 2: return reader.i16(offset);
        case 3: return reader.u16(offset);
        case 4: return reader.i32(offset);
        case 5: return reader.u32(offset);
        case 6: return reader.f32(offset);
        default: return 0;
    }
}

function componentByteSize(dataType) {
    switch (dataType) {
        case 0:
        case 1:
            return 1;
        case 2:
        case 3:
            return 2;
        case 4:
        case 5:
        case 6:
            return 4;
        default:
            return 4;
    }
}

function parseVertexGroup(reader, offset) {
    if (reader.u32(offset) !== 0x40000002) return null;

    const byteLength = reader.u32(offset + 0x14);
    const vertexData = reader.rel(offset + 0x18);
    const stride = reader.u32(offset + 0x24);
    const componentCount = reader.u32(offset + 0x28);
    const componentOffsets = reader.rel(offset + 0x2c);
    const vertexCount = Math.floor(byteLength / stride);
    const components = [];

    for (let i = 0; i < componentCount; i++) {
        const component = componentOffsets + i * 4 + reader.i32(componentOffsets + i * 4);
        if (reader.u32(component) !== 0x40000001) continue;
        components.push({
            type: reader.u32(component + 0x04),
            dataType: reader.u8(component + 0x24),
            count: reader.u32(component + 0x28),
            multiplier: reader.f32(component + 0x2c),
            offset: reader.u32(component + 0x30)
        });
    }

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    let hasNormals = false;
    let hasUvs = false;

    for (let i = 0; i < vertexCount; i++) {
        const base = vertexData + i * stride;
        for (const component of components) {
            const size = componentByteSize(component.dataType);
            const values = [];
            for (let n = 0; n < component.count; n++) {
                values.push(readComponentValue(reader, base + component.offset + n * size, component.dataType) * component.multiplier);
            }

            if (component.type === 0 && values.length >= 3) {
                positions[i * 3 + 0] = values[0];
                positions[i * 3 + 1] = values[1];
                positions[i * 3 + 2] = values[2];
            }
            else if (component.type === 1 && values.length >= 3) {
                normals[i * 3 + 0] = values[0];
                normals[i * 3 + 1] = values[1];
                normals[i * 3 + 2] = values[2];
                hasNormals = true;
            }
            else if (component.type === 4 && values.length >= 2) {
                uvs[i * 2 + 0] = values[0];
                uvs[i * 2 + 1] = 1 - values[1];
                hasUvs = true;
            }
        }
    }

    return { positions, normals: hasNormals ? normals : null, uvs: hasUvs ? uvs : null, vertexCount };
}

function descriptorIndicesToTriangles(rawIndices) {
    const triangles = [];
    for (let i = 0; i + 2 < rawIndices.length; i += 3) {
        const a = rawIndices[i];
        const b = rawIndices[i + 1];
        const c = rawIndices[i + 2];
        if (a === b || b === c || a === c) continue;
        triangles.push(a, b, c);
    }
    return triangles;
}

function parseFaceDescriptors(reader, sobjOffset) {
    const faceGroupCount = reader.u32(sobjOffset + 0x2c);
    const faceGroupOffsets = reader.rel(sobjOffset + 0x30);
    const indices = [];

    for (let groupIndex = 0; groupIndex < faceGroupCount; groupIndex++) {
        const groupField = faceGroupOffsets + groupIndex * 4;
        const faceGroup = groupField + reader.i32(groupField);
        const descriptorGroupCount = reader.u32(faceGroup + 0x0c);
        const descriptorGroupOffsets = reader.rel(faceGroup + 0x10);

        for (let dg = 0; dg < descriptorGroupCount; dg++) {
            const descriptorGroupField = descriptorGroupOffsets + dg * 4;
            const descriptorGroup = descriptorGroupField + reader.i32(descriptorGroupField);
            const descriptorCount = reader.u32(descriptorGroup + 0x00);
            const descriptorOffsets = reader.rel(descriptorGroup + 0x04);

            for (let descriptorIndex = 0; descriptorIndex < descriptorCount; descriptorIndex++) {
                const descriptorField = descriptorOffsets + descriptorIndex * 4;
                const descriptor = descriptorField + reader.i32(descriptorField);
                const flags = reader.u32(descriptor + 0x00);
                const byteLength = reader.u32(descriptor + 0x08);
                const data = reader.rel(descriptor + 0x0c);
                const indexByteSize = (flags & 0x02) ? 2 : 1;
                const raw = [];

                for (let offset = 0; offset < byteLength; offset += indexByteSize) {
                    raw.push(indexByteSize === 2 ? reader.u16(data + offset) : reader.u8(data + offset));
                }

                indices.push(...descriptorIndicesToTriangles(raw));
            }
        }
    }

    return indices;
}

function findMeshSobjOffsets(reader, cmdlOffset) {
    const candidates = [];
    for (const [countOffset, listOffset] of [[0xb4, 0xb8], [0xc4, 0xc8]]) {
        const count = reader.u32(cmdlOffset + countOffset);
        const list = reader.rel(cmdlOffset + listOffset);
        for (let i = 0; i < count; i++) {
            const field = list + i * 4;
            const sobj = field + reader.i32(field);
            if (reader.magic(sobj + 4, 'SOBJ')) candidates.push(sobj);
        }
    }

    return candidates.filter(sobj => reader.u32(sobj + 0x38) > 0 && reader.rel(sobj + 0x3c));
}

function findPrimaryVertexGroup(reader, sobjOffset) {
    const count = reader.u32(sobjOffset + 0x38);
    const offsets = reader.rel(sobjOffset + 0x3c);
    for (let i = 0; i < count; i++) {
        const field = offsets + i * 4;
        const vertexGroup = field + reader.i32(field);
        const parsed = parseVertexGroup(reader, vertexGroup);
        if (parsed) return parsed;
    }
    return null;
}

function decodeTiledTexture(reader, txobOffset) {
    const height = reader.u32(txobOffset + 0x18);
    const width = reader.u32(txobOffset + 0x1c);
    const format = reader.u32(txobOffset + 0x34);
    const data = reader.rel(txobOffset + 0x48);
    const rgba = new Uint8Array(width * height * 4);

    if (format === 0x0c || format === 0x0d) {
        decodeEtcTiledTexture(reader, format, data, width, height, rgba);
        smoothEtcTexture(rgba, width, height);
        return { width, height, rgba };
    }

    const bytesPerPixel = {
        0x00: 4,
        0x01: 3,
        0x02: 2,
        0x03: 2,
        0x04: 2,
        0x05: 2,
        0x07: 1,
        0x08: 1,
        0x09: 1,
        0x0a: 1
    }[format];

    if (!bytesPerPixel) return null;

    let src = data;
    for (let tileY = 0; tileY < height; tileY += 8) {
        for (let tileX = 0; tileX < width; tileX += 8) {
            for (let morton = 0; morton < 64; morton++) {
                let x = 0;
                let y = 0;
                for (let bit = 0; bit < 3; bit++) {
                    x |= ((morton >> (bit * 2)) & 1) << bit;
                    y |= ((morton >> (bit * 2 + 1)) & 1) << bit;
                }

                const dstX = tileX + x;
                const dstY = tileY + y;
                if (dstX < width && dstY < height) {
                    const dst = (dstY * width + dstX) * 4;
                    writeDecodedPixel(reader, format, src, rgba, dst);
                }
                src += bytesPerPixel;
            }
        }
    }

    return { width, height, rgba };
}

const etcModifierTables = [
    [2, 8, -2, -8],
    [5, 17, -5, -17],
    [9, 29, -9, -29],
    [13, 42, -13, -42],
    [18, 60, -18, -60],
    [24, 80, -24, -80],
    [33, 106, -33, -106],
    [47, 183, -47, -183]
];

function clampByte(value) {
    return Math.max(0, Math.min(255, value | 0));
}

function expand4To8(value) {
    return (value << 4) | value;
}

function expand5To8(value) {
    return (value << 3) | (value >> 2);
}

function signed3(value) {
    return value >= 4 ? value - 8 : value;
}

function decodeEtcColorBlock(reader, offset, rgba, width, height, dstX, dstY, alphaValues = null) {
    const high = reader.u32(offset + 4);
    const low = reader.u32(offset);
    const diff = (high >>> 1) & 1;
    const flip = high & 1;
    const table0 = (high >>> 5) & 7;
    const table1 = (high >>> 2) & 7;
    let r0, g0, b0, r1, g1, b1;

    if (diff) {
        const br0 = (high >>> 27) & 0x1f;
        const bg0 = (high >>> 19) & 0x1f;
        const bb0 = (high >>> 11) & 0x1f;
        const br1 = br0 + signed3((high >>> 24) & 7);
        const bg1 = bg0 + signed3((high >>> 16) & 7);
        const bb1 = bb0 + signed3((high >>> 8) & 7);
        r0 = expand5To8(br0);
        g0 = expand5To8(bg0);
        b0 = expand5To8(bb0);
        r1 = expand5To8(clampByte(br1) & 0x1f);
        g1 = expand5To8(clampByte(bg1) & 0x1f);
        b1 = expand5To8(clampByte(bb1) & 0x1f);
    }
    else {
        r0 = expand4To8((high >>> 28) & 0x0f);
        r1 = expand4To8((high >>> 24) & 0x0f);
        g0 = expand4To8((high >>> 20) & 0x0f);
        g1 = expand4To8((high >>> 16) & 0x0f);
        b0 = expand4To8((high >>> 12) & 0x0f);
        b1 = expand4To8((high >>> 8) & 0x0f);
    }

    for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
            const pixel = px * 4 + py;
            const code = (((low >>> (pixel + 16)) & 1) << 1) | ((low >>> pixel) & 1);
            const useSecond = flip ? py >= 2 : px >= 2;
            const table = etcModifierTables[useSecond ? table1 : table0];
            const modifier = table[code];
            const x = dstX + px;
            const y = dstY + py;
            if (x >= width || y >= height) continue;

            const dst = (y * width + x) * 4;
            const baseR = useSecond ? r1 : r0;
            const baseG = useSecond ? g1 : g0;
            const baseB = useSecond ? b1 : b0;
            rgba[dst + 0] = clampByte(baseR + modifier);
            rgba[dst + 1] = clampByte(baseG + modifier);
            rgba[dst + 2] = clampByte(baseB + modifier);
            rgba[dst + 3] = alphaValues ? alphaValues[py * 4 + px] : 255;
        }
    }
}

function readEtcAlphaBlock(reader, offset) {
    const alpha = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
        const value = reader.u8(offset + i);
        alpha[i * 2 + 0] = expand4To8(value & 0x0f);
        alpha[i * 2 + 1] = expand4To8(value >> 4);
    }
    return alpha;
}

function decodeEtcTiledTexture(reader, format, data, width, height, rgba) {
    const hasAlpha = format === 0x0d;
    const blockSize = hasAlpha ? 16 : 8;
    let src = data;

    for (let tileY = 0; tileY < height; tileY += 8) {
        for (let tileX = 0; tileX < width; tileX += 8) {
            for (const [blockX, blockY] of [[0, 0], [4, 0], [0, 4], [4, 4]]) {
                const alpha = hasAlpha ? readEtcAlphaBlock(reader, src) : null;
                decodeEtcColorBlock(
                    reader,
                    src + (hasAlpha ? 8 : 0),
                    rgba,
                    width,
                    height,
                    tileX + blockX,
                    tileY + blockY,
                    alpha
                );
                src += blockSize;
            }
        }
    }
}

function smoothEtcTexture(rgba, width, height) {
    const source = new Uint8Array(rgba);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let totalWeight = 0;
            const accum = [0, 0, 0];
            for (let oy = -1; oy <= 1; oy++) {
                for (let ox = -1; ox <= 1; ox++) {
                    const sx = Math.max(0, Math.min(width - 1, x + ox));
                    const sy = Math.max(0, Math.min(height - 1, y + oy));
                    const weight = ox === 0 && oy === 0 ? 4 : (ox === 0 || oy === 0 ? 2 : 1);
                    const src = (sy * width + sx) * 4;
                    accum[0] += source[src + 0] * weight;
                    accum[1] += source[src + 1] * weight;
                    accum[2] += source[src + 2] * weight;
                    totalWeight += weight;
                }
            }

            const dst = (y * width + x) * 4;
            rgba[dst + 0] = accum[0] / totalWeight;
            rgba[dst + 1] = accum[1] / totalWeight;
            rgba[dst + 2] = accum[2] / totalWeight;
        }
    }
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

function writeDecodedPixel(reader, format, src, rgba, dst) {
    if (format === 0x00) {
        rgba[dst + 0] = reader.u8(src + 0);
        rgba[dst + 1] = reader.u8(src + 1);
        rgba[dst + 2] = reader.u8(src + 2);
        rgba[dst + 3] = reader.u8(src + 3);
    }
    else if (format === 0x01) {
        rgba[dst + 0] = reader.u8(src + 0);
        rgba[dst + 1] = reader.u8(src + 1);
        rgba[dst + 2] = reader.u8(src + 2);
        rgba[dst + 3] = 255;
    }
    else if (format === 0x02) {
        const value = reader.u16(src);
        rgba[dst + 0] = expand5(value >> 11);
        rgba[dst + 1] = expand5(value >> 6);
        rgba[dst + 2] = expand5(value >> 1);
        rgba[dst + 3] = (value & 1) ? 255 : 0;
    }
    else if (format === 0x03) {
        const value = reader.u16(src);
        rgba[dst + 0] = expand5(value >> 11);
        rgba[dst + 1] = expand6(value >> 5);
        rgba[dst + 2] = expand5(value);
        rgba[dst + 3] = 255;
    }
    else if (format === 0x04) {
        const value = reader.u16(src);
        rgba[dst + 0] = expand4(value >> 12);
        rgba[dst + 1] = expand4(value >> 8);
        rgba[dst + 2] = expand4(value >> 4);
        rgba[dst + 3] = expand4(value);
    }
    else if (format === 0x05) {
        const l = reader.u8(src + 0);
        const a = reader.u8(src + 1);
        rgba[dst + 0] = l;
        rgba[dst + 1] = l;
        rgba[dst + 2] = l;
        rgba[dst + 3] = a;
    }
    else if (format === 0x07) {
        const l = reader.u8(src);
        rgba[dst + 0] = l;
        rgba[dst + 1] = l;
        rgba[dst + 2] = l;
        rgba[dst + 3] = 255;
    }
    else if (format === 0x08) {
        rgba[dst + 0] = 255;
        rgba[dst + 1] = 255;
        rgba[dst + 2] = 255;
        rgba[dst + 3] = reader.u8(src);
    }
    else if (format === 0x09) {
        const value = reader.u8(src);
        const l = expand4(value >> 4);
        const a = expand4(value);
        rgba[dst + 0] = l;
        rgba[dst + 1] = l;
        rgba[dst + 2] = l;
        rgba[dst + 3] = a;
    }
    else if (format === 0x0a) {
        const l = expand4(reader.u8(src) >> 4);
        rgba[dst + 0] = l;
        rgba[dst + 1] = l;
        rgba[dst + 2] = l;
        rgba[dst + 3] = 255;
    }
}

function createTexture(THREE, decoded) {
    if (!decoded) return null;
    const texture = new THREE.DataTexture(decoded.rgba, decoded.width, decoded.height, THREE.RGBAFormat);
    texture.userData.averageColor = averageTextureColor(decoded.rgba);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}

function averageTextureColor(rgba) {
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < rgba.length; i += 4) {
        const alpha = rgba[i + 3];
        if (alpha < 16) continue;
        r += rgba[i + 0];
        g += rgba[i + 1];
        b += rgba[i + 2];
        count++;
    }

    if (!count) return null;
    const minVisible = 36;
    return (Math.max(minVisible, r / count) << 16) |
        (Math.max(minVisible, g / count) << 8) |
        Math.max(minVisible, b / count);
}

function parseTextures(reader, dataDicts, THREE) {
    const textures = [];
    for (const entry of dataDicts[1] ?? []) {
        if (!reader.magic(entry.object + 4, 'TXOB')) continue;
        const texture = createTexture(THREE, decodeTiledTexture(reader, entry.object));
        if (texture) textures.push({ name: entry.name, texture });
    }
    return textures;
}

function makeMaterial(THREE, texture, fallbackColor, useTextureMap = true) {
    const material = new THREE.MeshStandardMaterial({
        color: texture && !useTextureMap ? texture.userData.averageColor ?? fallbackColor : (texture ? 0xffffff : fallbackColor),
        map: useTextureMap ? texture ?? null : null,
        roughness: 0.74,
        metalness: 0,
        side: THREE.DoubleSide,
        transparent: false
    });
    material.userData.fallbackColor = fallbackColor;
    return material;
}

function buildMesh(THREE, reader, sobjOffset, material) {
    const vertices = findPrimaryVertexGroup(reader, sobjOffset);
    if (!vertices) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices.positions, 3));
    if (vertices.normals) geometry.setAttribute('normal', new THREE.BufferAttribute(vertices.normals, 3));
    if (vertices.uvs) geometry.setAttribute('uv', new THREE.BufferAttribute(vertices.uvs, 2));

    const indices = parseFaceDescriptors(reader, sobjOffset);
    if (indices.length) {
        const IndexArray = vertices.vertexCount > 65535 ? Uint32Array : Uint16Array;
        geometry.setIndex(new THREE.BufferAttribute(new IndexArray(indices), 1));
    }
    if (!vertices.normals) geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, material);
    if (!vertices.uvs && material.map) {
        material.map = null;
        material.color.setHex(material.userData.fallbackColor ?? 0xb0b0b0);
        material.needsUpdate = true;
    }
    mesh.frustumCulled = false;
    return mesh;
}

function loadCgfxModelFromBuffer(buffer, THREE, options = {}) {
    const reader = new CgfxReader(buffer);
    const dataDicts = parseDataDicts(reader);
    const modelEntry = dataDicts[0]?.[0];
    if (!modelEntry || !reader.magic(modelEntry.object + 4, 'CMDL')) {
        throw new Error('CGFX CMDL model is missing.');
    }

    const textures = parseTextures(reader, dataDicts, THREE);
    const texture = textures.find(item => !/_NRM$/i.test(item.name))?.texture ?? null;
    const fallbackColor = options.fallbackColor ?? 0xb0b0b0;
    const material = makeMaterial(THREE, texture, fallbackColor, options.useTextureMap ?? true);
    const group = new THREE.Group();
    group.name = options.name ?? modelEntry.name;

    for (const sobjOffset of findMeshSobjOffsets(reader, modelEntry.object)) {
        const mesh = buildMesh(THREE, reader, sobjOffset, material.clone());
        if (mesh) group.add(mesh);
    }

    if (!group.children.length) throw new Error('CGFX model has no renderable meshes.');
    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(group);
    group.userData.cgfx = { bounds, textures: textures.map(item => item.name) };
    return { model: group, bounds, textures };
}

async function loadCgfxModelFromFS(path, THREE, options = {}) {
    const content = await fs.promises.readFile(path);
    return loadCgfxModelFromBuffer(content, THREE, { ...options, name: options.name ?? path });
}

export {
    loadCgfxModelFromBuffer,
    loadCgfxModelFromFS
};
