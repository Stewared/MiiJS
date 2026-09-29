import { Buffer } from "./platform.js";
import { Decompress as ZstdDecompress } from "fzstd";

const CHAR_INFO_SIZE = 152;
const MII_BLOCK_SIZE = 4 + CHAR_INFO_SIZE;
const PERSONALITY_SIZE = 18 * 4;
const DISPLAY_NAME_SIZE = 64;
const PRONUNCIATION_SIZE = 128;
const V2_SEXUALITY_SIZE = 3;
const V3_SEXUALITY_SIZE = 4;
const V2_MARKER = new Uint8Array([0xa3, 0xa3, 0xa3]);
const V3_CANVAS_MARKER = new Uint8Array([0xa3, 0xa3, 0xa3, 0xa3]);
const V3_UGC_MARKER = new Uint8Array([0xa4, 0xa4, 0xa4, 0xa4]);
const ZSTD_MAGIC = new Uint8Array([0x28, 0xb5, 0x2f, 0xfd]);
const CANVAS_DECOMPRESSED_SIZE = 256 * 256 * 4;
const UGC_DECOMPRESSED_SIZE = 512 * 512 / 2;

const PERSONALITY_FIELDS = [
    "sociability",
    "audaciousness",
    "activeness",
    "commonsense",
    "gaiety",
    "voiceFormant",
    "voiceSpeed",
    "voiceIntonation",
    "voicePitch",
    "voiceTension",
    "voicePresetTypeHash",
    "faceGenderHash",
    "pronounTypeHash",
    "clothStyleHash",
    "birthdayYear",
    "birthdayDay",
    "birthdayDirectAge",
    "birthdayMonth"
];

const CHAR_INFO_BYTE_FIELDS = [
    "fontRegion",
    "gender",
    "height",
    "build",
    "regionMove",
    "faceFlagsRaw",
    "facelineType",
    "facelineColor",
    "wrinkleUpperType",
    "wrinkleUpperScale",
    "wrinkleUpperAspect",
    "wrinkleUpperX",
    "wrinkleUpperY",
    "wrinkleLowerType",
    "wrinkleLowerScale",
    "wrinkleLowerAspect",
    "wrinkleLowerX",
    "wrinkleLowerY",
    "makeupUpperType",
    "makeupUpperColor",
    "makeupUpperScale",
    "makeupUpperAspect",
    "makeupUpperX",
    "makeupUpperY",
    "makeupLowerType",
    "makeupLowerColor",
    "makeupLowerScale",
    "makeupLowerAspect",
    "makeupLowerX",
    "makeupLowerY"
];

const CHAR_INFO_POST_HAIR_BYTE_FIELDS = [
    "hairColorPrimary",
    "hairColorSecondary",
    "hairFrontType",
    "hairBackType",
    "hairStyleFlagsRaw",
    "earType",
    "earScale",
    "earY",
    "eyeType",
    "eyeColor",
    "eyeScale",
    "eyeAspect",
    "eyeRotate",
    "eyeX",
    "eyeY",
    "eyeShadowColor",
    "eyeHighlightType",
    "eyeHighlightScale",
    "eyeHighlightAspect",
    "eyeHighlightRotate",
    "eyeHighlightX",
    "eyeHighlightY",
    "eyelashUpperType",
    "eyelashUpperScale",
    "eyelashUpperAspect",
    "eyelashUpperRotate",
    "eyelashUpperX",
    "eyelashUpperY",
    "eyelashLowerType",
    "eyelashLowerScale",
    "eyelashLowerAspect",
    "eyelashLowerRotate",
    "eyelashLowerX",
    "eyelashLowerY",
    "eyelidUpperType",
    "eyelidUpperScale",
    "eyelidUpperAspect",
    "eyelidUpperRotate",
    "eyelidUpperX",
    "eyelidUpperY",
    "eyelidLowerType",
    "eyelidLowerScale",
    "eyelidLowerAspect",
    "eyelidLowerRotate",
    "eyelidLowerX",
    "eyelidLowerY",
    "eyebrowType",
    "eyebrowColor",
    "eyebrowScale",
    "eyebrowAspect",
    "eyebrowRotate",
    "eyebrowX",
    "eyebrowY",
    "noseType",
    "noseScale",
    "noseY",
    "mouthType",
    "mouthColor",
    "mouthScale",
    "mouthAspect",
    "mouthRotate",
    "mouthY",
    "beardType",
    "beardColor",
    "stubbleType",
    "stubbleColor",
    "mustacheType",
    "mustacheColor",
    "mustacheScale",
    "mustacheAspect",
    "mustacheY",
    "glassPrimaryType",
    "glassPrimaryColor",
    "glassScale",
    "glassAspect",
    "glassY",
    "glassLensMaterialMode",
    "glassLensColor",
    "moleScale",
    "moleX",
    "moleY",
    "schemaVersion"
];

const HASH_NAMES = new Map([
    [0x0ddcbe76, "male"],
    [0x3be5d8d4, "he"],
    [0x3b1f8b15, "female"],
    [0x25af6ee5, "she"]
]);

class LtdFormatError extends Error {
    constructor(message, code = "invalid_ltd") {
        super(message);
        this.name = "LtdFormatError";
        this.code = code;
    }
}

function asBytes(value, field = "input") {
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
        return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (value instanceof ArrayBuffer || (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer)) {
        return new Uint8Array(value);
    }
    if (typeof value === "string" && /^(?:[0-9a-f]{2})*$/i.test(value)) {
        return Uint8Array.from(value.match(/../g) ?? [], byte => Number.parseInt(byte, 16));
    }
    // JSON.stringify(Uint8Array) produces an object with contiguous numeric keys.
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const keys = Object.keys(value);
        const out = new Uint8Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
            if (!Object.prototype.hasOwnProperty.call(value, String(i))) break;
            const byte = value[i];
            if (!Number.isInteger(byte) || byte < 0 || byte > 255) break;
            out[i] = byte;
            if (i === keys.length - 1) return out;
        }
        if (keys.length === 0) return out;
    }
    throw new TypeError(`${field} must be a Buffer, Uint8Array, or ArrayBuffer`);
}

function copyBytes(value, field) {
    return asBytes(value, field).slice();
}

function requireRange(bytes, offset, length, section) {
    if (!Number.isInteger(offset) || !Number.isInteger(length) || offset < 0 || length < 0 || offset + length > bytes.length) {
        throw new LtdFormatError(`truncated ${section}: expected ${length} byte(s) at 0x${offset.toString(16)}, got ${Math.max(0, bytes.length - offset)}`, "truncated_ltd");
    }
    return bytes.subarray(offset, offset + length);
}

function matchesAt(bytes, marker, offset) {
    if (offset < 0 || offset + marker.length > bytes.length) return false;
    for (let i = 0; i < marker.length; i++) {
        if (bytes[offset + i] !== marker[i]) return false;
    }
    return true;
}

function decodeUtf16LE(bytes) {
    let result = "";
    for (let i = 0; i + 1 < bytes.length; i += 2) {
        const codeUnit = bytes[i] | (bytes[i + 1] << 8);
        if (codeUnit === 0) break;
        result += String.fromCharCode(codeUnit);
    }
    return result;
}

function encodePreservingText(value, originalBytes, byteLength, field) {
    if (originalBytes !== undefined) {
        const raw = asBytes(originalBytes, `${field}Bytes`);
        if (raw.length === byteLength && decodeUtf16LE(raw) === value) return raw.slice();
    }
    if (typeof value !== "string") throw new TypeError(`${field} must be a string`);
    if (value.length > byteLength / 2) {
        throw new RangeError(`${field} exceeds its ${byteLength / 2} UTF-16 code-unit field`);
    }
    const out = new Uint8Array(byteLength);
    for (let i = 0; i < value.length; i++) {
        const codeUnit = value.charCodeAt(i);
        out[i * 2] = codeUnit & 0xff;
        out[i * 2 + 1] = codeUnit >>> 8;
    }
    return out;
}

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeUuidHex(value, field = "uuidRaw") {
    if (typeof value !== "string") throw new TypeError(`${field} must be a UUID or 32-digit hex string`);
    const compact = value.replaceAll("-", "").toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(compact)) throw new RangeError(`${field} must contain exactly 16 bytes`);
    return compact;
}

function formatUuid(hex) {
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function numeric(value, minimum, maximum, field) {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new RangeError(`${field} must be an integer from ${minimum} through ${maximum}`);
    }
    return value;
}

function booleanValue(value, field) {
    if (typeof value !== "boolean") throw new TypeError(`${field} must be a boolean`);
    return value;
}

function inspectZstdFrame(bytes, offset = 0) {
    requireRange(bytes, offset, 5, "Zstandard frame header");
    if (!matchesAt(bytes, ZSTD_MAGIC, offset)) {
        throw new LtdFormatError(`expected a Zstandard frame at 0x${offset.toString(16)}`, "invalid_ltd_texture");
    }

    const descriptor = bytes[offset + 4];
    if (descriptor & 0x18) {
        throw new LtdFormatError(`invalid Zstandard frame descriptor at 0x${(offset + 4).toString(16)}`, "invalid_ltd_texture");
    }
    const singleSegment = (descriptor >>> 5) & 1;
    if ((descriptor >>> 2) & 1) {
        throw new LtdFormatError("checksum-bearing Zstandard frames are not supported by the LTD validator", "unsupported_ltd_texture");
    }
    if ((descriptor & 3) !== 0) {
        throw new LtdFormatError("dictionary-bearing Zstandard frames are not supported by LTD", "unsupported_ltd_texture");
    }
    const contentSizeFlag = descriptor >>> 6;
    const contentSizeBytes = contentSizeFlag === 0 ? singleSegment : (1 << contentSizeFlag);
    const contentSizeOffset = offset + (singleSegment ? 5 : 6);
    let cursor = contentSizeOffset + contentSizeBytes;
    requireRange(bytes, offset, cursor - offset, "Zstandard frame header");
    let contentSize = null;
    if (contentSizeBytes) {
        contentSize = 0n;
        for (let i = 0; i < contentSizeBytes; i++) {
            contentSize |= BigInt(bytes[contentSizeOffset + i]) << BigInt(i * 8);
        }
    }
    if (contentSizeFlag === 1) contentSize += 256n;
    let windowSize = contentSize;
    if (!singleSegment) {
        const windowDescriptor = bytes[offset + 5];
        const base = 1n << BigInt(10 + (windowDescriptor >>> 3));
        windowSize = base + (base >> 3n) * BigInt(windowDescriptor & 7);
    }
    let last = false;
    while (!last) {
        const header = requireRange(bytes, cursor, 3, "Zstandard block header");
        const packed = header[0] | (header[1] << 8) | (header[2] << 16);
        last = (packed & 1) !== 0;
        const blockType = (packed >>> 1) & 3;
        const blockSize = packed >>> 3;
        if (blockType === 3 || blockSize > Number(windowSize < 131072n ? windowSize : 131072n)) {
            throw new LtdFormatError(`invalid Zstandard block at 0x${cursor.toString(16)}`, "invalid_ltd_texture");
        }
        cursor += 3;
        const encodedSize = blockType === 1 ? 1 : blockSize;
        requireRange(bytes, cursor, encodedSize, "Zstandard block payload");
        cursor += encodedSize;
    }
    return { byteLength: cursor - offset, contentSize, windowSize };
}

/** Return the encoded size of exactly one ordinary Zstandard frame. */
function zstdFrameByteLength(bytes, offset = 0) {
    return inspectZstdFrame(bytes, offset).byteLength;
}

function validateTexturePayload(payload, declaredPresent, section, expectedDecodedSize) {
    if (!declaredPresent) {
        if (payload.length !== 0) {
            throw new LtdFormatError(`${section} payload is present while its header flag is false`, "invalid_ltd_texture");
        }
        return;
    }
    const frame = inspectZstdFrame(payload, 0);
    if (frame.byteLength !== payload.length) {
        throw new LtdFormatError(`${section} must contain exactly one Zstandard frame`, "invalid_ltd_texture");
    }
    const expectedSize = BigInt(expectedDecodedSize);
    if (frame.contentSize === null || frame.contentSize !== expectedSize) {
        throw new LtdFormatError(`${section} declares ${frame.contentSize === null ? "no decoded size" : `${frame.contentSize} decoded bytes`}; expected ${expectedDecodedSize}`, "invalid_ltd_texture");
    }
    if (frame.windowSize !== null && frame.windowSize > expectedSize) {
        throw new LtdFormatError(`${section} declares a Zstandard window larger than its ${expectedDecodedSize}-byte surface`, "invalid_ltd_texture");
    }
    let decodedLength = 0;
    try {
        new ZstdDecompress(chunk => {
            decodedLength += chunk.length;
            if (decodedLength > expectedDecodedSize) {
                throw new LtdFormatError(`${section} expands beyond its ${expectedDecodedSize}-byte surface`, "invalid_ltd_texture");
            }
        }).push(payload, true);
    } catch (error) {
        if (error instanceof LtdFormatError) throw error;
        throw new LtdFormatError(`${section} contains an invalid Zstandard frame: ${error.message}`, "invalid_ltd_texture");
    }
    if (decodedLength !== expectedDecodedSize) {
        throw new LtdFormatError(`${section} must decode to ${expectedDecodedSize} bytes, got ${decodedLength}`, "invalid_ltd_texture");
    }
}

function parseCharInfoEx(value) {
    const bytes = asBytes(value, "CharInfoEx");
    if (bytes.length !== CHAR_INFO_SIZE) {
        throw new LtdFormatError(`CharInfoEx must be ${CHAR_INFO_SIZE} bytes, got ${bytes.length}`, "invalid_ltd_char_info");
    }
    const uuidRaw = bytesToHex(bytes.subarray(0, 16));
    const nameBytes = bytes.slice(16, 38);
    const result = {
        uuidRaw,
        uuid: formatUuid(uuidRaw),
        name: decodeUtf16LE(nameBytes),
        nameBytes
    };
    let cursor = 38;
    for (const field of CHAR_INFO_BYTE_FIELDS) result[field] = bytes[cursor++];
    result.hairType = bytes[cursor] | (bytes[cursor + 1] << 8);
    cursor += 2;
    for (const field of CHAR_INFO_POST_HAIR_BYTE_FIELDS) result[field] = bytes[cursor++];
    if (cursor !== CHAR_INFO_SIZE) throw new Error(`internal CharInfoEx layout error: ${cursor}`);

    const faceFlags = result.faceFlagsRaw;
    result.faceFlags = {
        specialMii: Boolean(faceFlags & 0x01),
        bangsSide: Boolean(faceFlags & 0x02),
        backDualColor: Boolean(faceFlags & 0x04),
        bangsDualColor: Boolean(faceFlags & 0x08),
        eyeShadowEnabled: Boolean(faceFlags & 0x10),
        mouthInverted: Boolean(faceFlags & 0x20),
        mustacheInverted: Boolean(faceFlags & 0x40),
        moleEnabled: Boolean(faceFlags & 0x80)
    };
    const hairFlags = result.hairStyleFlagsRaw;
    result.hairStyleFlags = {
        leftSide: Boolean(hairFlags & 0x01),
        rightSide: Boolean(hairFlags & 0x02),
        reserved: hairFlags >>> 2
    };
    return result;
}

function payloadRecord(payload, offset, declaredPresent) {
    return {
        offset,
        byteLength: payload.length,
        declaredPresent,
        compression: payload.length && matchesAt(payload, ZSTD_MAGIC, 0) ? "zstandard" : null,
        data: payload.slice()
    };
}

function section(offset, byteLength) {
    return { offset, byteLength };
}

function parseLtdContainer(value) {
    const bytes = asBytes(value);
    if (bytes.length < 1) throw new LtdFormatError("file is too short to contain an LTD header", "truncated_ltd");
    const originalVersion = bytes[0];
    if (originalVersion !== 2 && originalVersion !== 3) {
        throw new LtdFormatError(`only LTD ShareMii versions 2 and 3 are supported, got ${originalVersion}`, "unsupported_ltd_version");
    }

    const v2 = originalVersion === 2;
    const headerSize = v2 ? 5 : 4;
    const headerBytes = requireRange(bytes, 0, headerSize, `LTD v${originalVersion} header`);
    if (headerBytes[1] > 1 || headerBytes[2] > 1) {
        throw new LtdFormatError("LTD texture-presence flags must each be 0 or 1", "invalid_ltd_header");
    }
    const hasCanvas = headerBytes[1] !== 0;
    const hasUgcTexture = headerBytes[2] !== 0;
    const miiBlockOffset = headerSize;
    const miiBlock = requireRange(bytes, miiBlockOffset, MII_BLOCK_SIZE, "LTD Mii block");
    const charInfoLength = new DataView(miiBlock.buffer, miiBlock.byteOffset, 4).getUint32(0, true);
    if (charInfoLength !== CHAR_INFO_SIZE) {
        throw new LtdFormatError(`expected CharInfoEx length ${CHAR_INFO_SIZE}, got ${charInfoLength}`, "invalid_ltd_char_info");
    }

    let cursor = miiBlockOffset + 4;
    const serializedSections = {
        formatHeader: section(0, headerSize),
        miiBlock: section(miiBlockOffset, MII_BLOCK_SIZE),
        charInfo: section(cursor, charInfoLength)
    };
    cursor += charInfoLength;
    serializedSections.personalityAndVoice = section(cursor, PERSONALITY_SIZE);
    const personalityBytes = requireRange(bytes, cursor, PERSONALITY_SIZE, "personality and voice block");
    const personalityAndVoice = {};
    for (let i = 0; i < PERSONALITY_FIELDS.length; i++) {
        personalityAndVoice[PERSONALITY_FIELDS[i]] = new DataView(
            personalityBytes.buffer,
            personalityBytes.byteOffset + i * 4,
            4
        ).getInt32(0, true);
    }
    personalityAndVoice.voicePresetType = HASH_NAMES.get(personalityAndVoice.voicePresetTypeHash) ?? null;
    personalityAndVoice.faceGender = HASH_NAMES.get(personalityAndVoice.faceGenderHash) ?? null;
    personalityAndVoice.pronounType = HASH_NAMES.get(personalityAndVoice.pronounTypeHash) ?? null;
    personalityAndVoice.clothStyle = HASH_NAMES.get(personalityAndVoice.clothStyleHash) ?? null;
    cursor += PERSONALITY_SIZE;
    serializedSections.displayName = section(cursor, DISPLAY_NAME_SIZE);
    const displayNameBytes = requireRange(bytes, cursor, DISPLAY_NAME_SIZE, "display name").slice();
    cursor += DISPLAY_NAME_SIZE;
    serializedSections.pronunciation = section(cursor, PRONUNCIATION_SIZE);
    const pronunciationBytes = requireRange(bytes, cursor, PRONUNCIATION_SIZE, "pronunciation").slice();
    cursor += PRONUNCIATION_SIZE;
    const sexualitySize = v2 ? V2_SEXUALITY_SIZE : V3_SEXUALITY_SIZE;
    serializedSections.sexuality = section(cursor, sexualitySize);
    const sexualityBytes = requireRange(bytes, cursor, sexualitySize, "sexuality block").slice();
    cursor += sexualitySize;

    serializedSections.canvasMarker = section(cursor, v2 ? V2_MARKER.length : V3_CANVAS_MARKER.length);
    let canvasMarker;
    let canvasPayloadOffset;
    let canvasPayload;
    let ugcMarkerOffset;
    let ugcMarker;
    if (v2) {
        canvasMarker = requireRange(bytes, cursor, V2_MARKER.length, "v2 canvas marker");
        if (!matchesAt(canvasMarker, V2_MARKER, 0)) {
            throw new LtdFormatError(`expected LTD v2 canvas marker at 0x${cursor.toString(16)}`, "missing_ltd_marker");
        }
        canvasPayloadOffset = cursor + V2_MARKER.length;
        ugcMarkerOffset = canvasPayloadOffset
            + (hasCanvas ? zstdFrameByteLength(bytes, canvasPayloadOffset) : 0);
        ugcMarker = requireRange(bytes, ugcMarkerOffset, V2_MARKER.length, "v2 UGC texture marker");
        if (!matchesAt(ugcMarker, V2_MARKER, 0)) {
            throw new LtdFormatError(`expected LTD v2 UGC marker immediately after the canvas frame at 0x${ugcMarkerOffset.toString(16)}`, "missing_ltd_marker");
        }
        canvasPayload = bytes.subarray(canvasPayloadOffset, ugcMarkerOffset);
    } else {
        canvasMarker = requireRange(bytes, cursor, V3_CANVAS_MARKER.length, "v3 canvas marker");
        if (!matchesAt(canvasMarker, V3_CANVAS_MARKER, 0)) {
            throw new LtdFormatError(`expected LTD v3 canvas marker at 0x${cursor.toString(16)}`, "missing_ltd_marker");
        }
        canvasPayloadOffset = cursor + V3_CANVAS_MARKER.length;
        ugcMarkerOffset = canvasPayloadOffset
            + (hasCanvas ? zstdFrameByteLength(bytes, canvasPayloadOffset) : 0);
        ugcMarker = requireRange(bytes, ugcMarkerOffset, V3_UGC_MARKER.length, "v3 UGC texture marker");
        if (!matchesAt(ugcMarker, V3_UGC_MARKER, 0)) {
            throw new LtdFormatError(`expected LTD v3 UGC marker immediately after the canvas frame at 0x${ugcMarkerOffset.toString(16)}`, "missing_ltd_marker");
        }
        canvasPayload = bytes.subarray(canvasPayloadOffset, ugcMarkerOffset);
    }

    const ugcPayloadOffset = ugcMarkerOffset + ugcMarker.length;
    const ugcPayload = bytes.subarray(ugcPayloadOffset);
    serializedSections.canvasTexturePayload = section(canvasPayloadOffset, canvasPayload.length);
    serializedSections.ugcTextureMarker = section(ugcMarkerOffset, ugcMarker.length);
    serializedSections.ugcTexturePayload = section(ugcPayloadOffset, ugcPayload.length);
    validateTexturePayload(canvasPayload, hasCanvas, "canvas texture", CANVAS_DECOMPRESSED_SIZE);
    validateTexturePayload(ugcPayload, hasUgcTexture, "UGC texture", UGC_DECOMPRESSED_SIZE);

    const loveGenderRaw = Array.from(sexualityBytes);
    const loveGender = {
        male: Boolean(sexualityBytes[0]),
        female: Boolean(sexualityBytes[1]),
        third: Boolean(sexualityBytes[2]),
        raw: loveGenderRaw.slice(),
        sourceRaw: loveGenderRaw,
        serializedLength: sexualitySize
    };
    if (!v2) loveGender.uninterpretedFourthByte = sexualityBytes[3];

    return {
        format: "Tomodachi Life: Living the Dream ShareMii",
        version: originalVersion,
        originalVersion,
        byteLength: bytes.length,
        header: {
            version: originalVersion,
            hasCanvas,
            hasUgcTexture,
            reserved: headerBytes[3],
            charInfoLength,
            ...(v2 ? { legacyPadding: headerBytes[4] } : {})
        },
        charInfo: parseCharInfoEx(miiBlock.subarray(4)),
        personalityAndVoice,
        displayName: decodeUtf16LE(displayNameBytes),
        displayNameBytes,
        pronunciation: decodeUtf16LE(pronunciationBytes),
        pronunciationBytes,
        loveGender,
        canvasMarker: bytesToHex(canvasMarker),
        ugcTextureMarker: bytesToHex(ugcMarker),
        canvasTexturePayload: payloadRecord(canvasPayload, canvasPayloadOffset, hasCanvas),
        ugcTexturePayload: payloadRecord(ugcPayload, ugcPayloadOffset, hasUgcTexture),
        serializedSections
    };
}

/** Decode an LTD ShareMii v2/v3 file into a MiiJS-compatible object. */
function decodeLtdMii(value) {
    const ltd = parseLtdContainer(value);
    ltd.canonicalProjection = {
        name: ltd.displayName,
        miiId: ltd.charInfo.uuidRaw,
        type: ltd.charInfo.faceFlagsRaw & 1 ? "Special" : "Default",
        gender: ltd.charInfo.gender,
        height: ltd.charInfo.height,
        weight: ltd.charInfo.build
    };
    const meta = {};
    Object.defineProperties(meta, {
        name: {
            enumerable: true,
            get: () => ltd.displayName,
            set: value => { ltd.displayName = value; }
        },
        miiId: {
            enumerable: true,
            get: () => ltd.charInfo.uuidRaw.toUpperCase(),
            set: value => {
                const uuidRaw = normalizeUuidHex(value, "meta.miiId");
                ltd.charInfo.uuidRaw = uuidRaw;
                ltd.charInfo.uuid = formatUuid(uuidRaw);
            }
        },
        type: {
            enumerable: true,
            get: () => ltd.charInfo.faceFlagsRaw & 1 ? "Special" : "Default",
            set: value => {
                if (value !== "Special" && value !== "Default") throw new RangeError("meta.type must be Special or Default for LTD data");
                ltd.charInfo.faceFlagsRaw = value === "Special"
                    ? ltd.charInfo.faceFlagsRaw | 1
                    : ltd.charInfo.faceFlagsRaw & 0xfe;
                ltd.charInfo.faceFlags.specialMii = value === "Special";
            }
        }
    });
    const general = {};
    for (const [canonicalField, ltdField] of [["gender", "gender"], ["height", "height"], ["weight", "build"]]) {
        Object.defineProperty(general, canonicalField, {
            enumerable: true,
            get: () => ltd.charInfo[ltdField],
            set: value => { ltd.charInfo[ltdField] = value; }
        });
    }
    return { meta, general, ltd };
}

function reconcileProjectionField({ baseline, canonical, current, field, normalize = value => value, apply }) {
    if (canonical === undefined) return;
    const normalizedBaseline = normalize(baseline);
    const normalizedCanonical = normalize(canonical);
    const normalizedCurrent = normalize(current);
    const canonicalChanged = normalizedCanonical !== normalizedBaseline;
    if (canonicalChanged && normalizedCurrent !== normalizedBaseline && normalizedCanonical !== normalizedCurrent) {
        throw new LtdFormatError(`conflicting edits to ${field} and its ltd source field`, "conflicting_ltd_edit");
    }
    if (canonicalChanged) apply(canonical);
}

/** Encode a decoded LTD object while preserving its original v2 or v3 wire version. */
function encodeLtdMii(value) {
    const source = structuredClone(value?.fields ?? value);
    const ltd = source?.ltd ?? source;
    if (!ltd || typeof ltd !== "object") throw new TypeError("encoding LTD requires a decoded object with an ltd namespace");
    const baseline = ltd.canonicalProjection;
    if (baseline && source?.ltd) {
        reconcileProjectionField({
            baseline: baseline.name,
            canonical: source.meta?.name,
            current: ltd.displayName,
            field: "meta.name",
            apply: value => { ltd.displayName = value; }
        });
        reconcileProjectionField({
            baseline: baseline.miiId,
            canonical: source.meta?.miiId,
            current: ltd.charInfo.uuidRaw,
            field: "meta.miiId",
            normalize: value => normalizeUuidHex(value, "meta.miiId"),
            apply: value => {
                const uuidRaw = normalizeUuidHex(value, "meta.miiId");
                ltd.charInfo.uuidRaw = uuidRaw;
                ltd.charInfo.uuid = formatUuid(uuidRaw);
            }
        });
        reconcileProjectionField({
            baseline: baseline.type,
            canonical: source.meta?.type,
            current: ltd.charInfo.faceFlagsRaw & 1 ? "Special" : "Default",
            field: "meta.type",
            apply: value => {
                if (value !== "Special" && value !== "Default") throw new RangeError("meta.type must be Special or Default for LTD data");
                ltd.charInfo.faceFlagsRaw = value === "Special"
                    ? ltd.charInfo.faceFlagsRaw | 1
                    : ltd.charInfo.faceFlagsRaw & 0xfe;
            }
        });
        for (const [canonicalField, ltdField] of [["gender", "gender"], ["height", "height"], ["weight", "build"]]) {
            reconcileProjectionField({
                baseline: baseline[canonicalField],
                canonical: source.general?.[canonicalField],
                current: ltd.charInfo[ltdField],
                field: `general.${canonicalField}`,
                apply: value => { ltd.charInfo[ltdField] = value; }
            });
        }
    }
    const version = ltd.originalVersion;
    if (version !== 2 && version !== 3) throw new LtdFormatError(`only LTD ShareMii versions 2 and 3 are supported, got ${version}`, "unsupported_ltd_version");
    if ((ltd.version !== undefined && ltd.version !== version) || (ltd.header?.version !== undefined && ltd.header.version !== version)) {
        throw new LtdFormatError("LTD wire-version conversion is not supported; version and header.version must match originalVersion", "unsupported_ltd_version");
    }
    const header = ltd.header ?? {};
    const hasCanvas = booleanValue(header.hasCanvas, "ltd.header.hasCanvas");
    const hasUgcTexture = booleanValue(header.hasUgcTexture, "ltd.header.hasUgcTexture");
    const headerBytes = version === 2 ? new Uint8Array(5) : new Uint8Array(4);
    headerBytes[0] = version;
    headerBytes[1] = hasCanvas ? 1 : 0;
    headerBytes[2] = hasUgcTexture ? 1 : 0;
    if (header.charInfoLength !== undefined && header.charInfoLength !== CHAR_INFO_SIZE) {
        throw new LtdFormatError(`ltd.header.charInfoLength must remain ${CHAR_INFO_SIZE}`, "invalid_ltd_char_info");
    }
    headerBytes[3] = numeric(header.reserved, 0, 255, "ltd.header.reserved");
    if (version === 2) headerBytes[4] = numeric(header.legacyPadding, 0, 255, "ltd.header.legacyPadding");

    const miiBlock = new Uint8Array(MII_BLOCK_SIZE);
    new DataView(miiBlock.buffer, miiBlock.byteOffset, 4).setUint32(0, CHAR_INFO_SIZE, true);
    if (!ltd.charInfo || typeof ltd.charInfo !== "object") throw new TypeError("ltd.charInfo is required");
    const encodedCharInfo = miiBlock.subarray(4);
    encodedCharInfo.set(Uint8Array.from(
        normalizeUuidHex(ltd.charInfo.uuidRaw ?? ltd.charInfo.uuid, "ltd.charInfo.uuidRaw").match(/../g),
        byte => Number.parseInt(byte, 16)
    ));
    encodedCharInfo.set(encodePreservingText(ltd.charInfo.name, ltd.charInfo.nameBytes, 22, "ltd.charInfo.name"), 16);
    let charInfoOffset = 38;
    for (const field of CHAR_INFO_BYTE_FIELDS) {
        encodedCharInfo[charInfoOffset++] = numeric(ltd.charInfo[field], 0, 255, `ltd.charInfo.${field}`);
    }
    const hairType = numeric(ltd.charInfo.hairType, 0, 65535, "ltd.charInfo.hairType");
    encodedCharInfo[charInfoOffset++] = hairType & 0xff;
    encodedCharInfo[charInfoOffset++] = hairType >>> 8;
    for (const field of CHAR_INFO_POST_HAIR_BYTE_FIELDS) {
        encodedCharInfo[charInfoOffset++] = numeric(ltd.charInfo[field], 0, 255, `ltd.charInfo.${field}`);
    }

    if (!ltd.personalityAndVoice || typeof ltd.personalityAndVoice !== "object") {
        throw new TypeError("ltd.personalityAndVoice is required");
    }
    const encodedPersonality = new Uint8Array(PERSONALITY_SIZE);
    for (let i = 0; i < PERSONALITY_FIELDS.length; i++) {
        const field = PERSONALITY_FIELDS[i];
        new DataView(encodedPersonality.buffer, encodedPersonality.byteOffset + i * 4, 4).setInt32(
            0,
            numeric(ltd.personalityAndVoice[field], -2147483648, 2147483647, `ltd.personalityAndVoice.${field}`),
            true
        );
    }

    const loveGender = ltd.loveGender;
    if (!loveGender || typeof loveGender !== "object") throw new TypeError("ltd.loveGender is required");
    const loveGenderLength = version === 2 ? V2_SEXUALITY_SIZE : V3_SEXUALITY_SIZE;
    if (loveGender.raw === undefined) throw new TypeError("ltd.loveGender.raw is required");
    if (loveGender.sourceRaw === undefined) throw new TypeError("ltd.loveGender.sourceRaw is required for edit reconciliation");
    if (!Array.isArray(loveGender.raw) && !ArrayBuffer.isView(loveGender.raw)) {
        throw new TypeError("ltd.loveGender.raw must be an array or typed array");
    }
    if (!Array.isArray(loveGender.sourceRaw) && !ArrayBuffer.isView(loveGender.sourceRaw)) {
        throw new TypeError("ltd.loveGender.sourceRaw must be an array or typed array");
    }
    const rawLoveGender = Array.from(loveGender.raw);
    const sourceLoveGender = Array.from(loveGender.sourceRaw);
    if (rawLoveGender.length !== loveGenderLength) {
        throw new RangeError(`ltd.loveGender.raw must contain ${loveGenderLength} bytes for LTD v${version}`);
    }
    if (sourceLoveGender.length !== loveGenderLength) {
        throw new RangeError(`ltd.loveGender.sourceRaw must contain ${loveGenderLength} bytes for LTD v${version}`);
    }
    for (let i = 0; i < rawLoveGender.length; i++) numeric(rawLoveGender[i], 0, 255, `ltd.loveGender.raw[${i}]`);
    for (let i = 0; i < sourceLoveGender.length; i++) numeric(sourceLoveGender[i], 0, 255, `ltd.loveGender.sourceRaw[${i}]`);
    const encodedLoveGender = Uint8Array.from(rawLoveGender);
    const loveGenderFields = ["male", "female", "third"];
    for (let i = 0; i < loveGenderFields.length; i++) {
        const field = loveGenderFields[i];
        if (loveGender[field] !== undefined) {
            const requested = booleanValue(loveGender[field], `ltd.loveGender.${field}`);
            const rawChanged = rawLoveGender[i] !== sourceLoveGender[i];
            const aliasChanged = requested !== Boolean(sourceLoveGender[i]);
            if (rawChanged && aliasChanged && Boolean(rawLoveGender[i]) !== requested) {
                throw new LtdFormatError(`conflicting edits to ltd.loveGender.raw[${i}] and ltd.loveGender.${field}`, "conflicting_ltd_edit");
            }
            if (aliasChanged && !rawChanged) encodedLoveGender[i] = requested ? 1 : 0;
        }
    }
    if (version === 3 && loveGender.uninterpretedFourthByte !== undefined) {
        const requested = numeric(loveGender.uninterpretedFourthByte, 0, 255, "ltd.loveGender.uninterpretedFourthByte");
        const rawChanged = rawLoveGender[3] !== sourceLoveGender[3];
        const aliasChanged = requested !== sourceLoveGender[3];
        if (rawChanged && aliasChanged && rawLoveGender[3] !== requested) {
            throw new LtdFormatError("conflicting edits to ltd.loveGender.raw[3] and ltd.loveGender.uninterpretedFourthByte", "conflicting_ltd_edit");
        }
        if (aliasChanged && !rawChanged) encodedLoveGender[3] = requested;
    }

    if (ltd.canvasTexturePayload?.data === undefined || ltd.ugcTexturePayload?.data === undefined) {
        throw new TypeError("both LTD texture payload data fields are required, including empty payloads");
    }
    const canvasPayload = copyBytes(ltd.canvasTexturePayload.data, "ltd.canvasTexturePayload.data");
    const ugcPayload = copyBytes(ltd.ugcTexturePayload.data, "ltd.ugcTexturePayload.data");
    validateTexturePayload(canvasPayload, hasCanvas, "canvas texture", CANVAS_DECOMPRESSED_SIZE);
    validateTexturePayload(ugcPayload, hasUgcTexture, "UGC texture", UGC_DECOMPRESSED_SIZE);
    const parts = [
        headerBytes,
        miiBlock,
        encodedPersonality,
        encodePreservingText(ltd.displayName, ltd.displayNameBytes, DISPLAY_NAME_SIZE, "ltd.displayName"),
        encodePreservingText(ltd.pronunciation, ltd.pronunciationBytes, PRONUNCIATION_SIZE, "ltd.pronunciation"),
        encodedLoveGender,
        version === 2 ? V2_MARKER : V3_CANVAS_MARKER,
        canvasPayload,
        version === 2 ? V2_MARKER : V3_UGC_MARKER,
        ugcPayload
    ];
    const encoded = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
    let encodedOffset = 0;
    for (const part of parts) {
        encoded.set(part, encodedOffset);
        encodedOffset += part.length;
    }
    parseLtdContainer(encoded);
    return Buffer.from(encoded);
}

/** Structural predicate used by automatic format detection. */
function isLtdMii(value) {
    try {
        parseLtdContainer(value);
        return true;
    } catch {
        return false;
    }
}

export {
    CHAR_INFO_SIZE,
    LtdFormatError,
    decodeLtdMii,
    encodeLtdMii,
    isLtdMii,
    parseCharInfoEx,
    parseLtdContainer,
    zstdFrameByteLength
};
