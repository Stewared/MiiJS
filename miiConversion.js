import { Buffer, randomBytes } from "./platform.js";
import { MiiFormats, formats, mappings } from "./formats.js";
import { decodeMii, encodeMii, isMiiInFormat } from "./miiProcess.js";
import {
    decodeLtdMii,
    encodeLtdMii,
    parseCharInfoEx,
    parseLtdContainer
} from "./ltd.js";
import reviewedLtdCharInfoBackport from "./ltdCharInfoBackportData.js";

const CHAR_INFO_SIZE = 0x58;
const CHAR_INFO_EX_SIZE = 0x98;
const LTD_PERSONALITY_FIELDS = Object.freeze([
    "sociability", "audaciousness", "activeness", "commonsense", "gaiety",
    "voiceFormant", "voiceSpeed", "voiceIntonation", "voicePitch", "voiceTension",
    "voicePresetTypeHash", "faceGenderHash", "pronounTypeHash", "clothStyleHash",
    "birthdayYear", "birthdayDay", "birthdayDirectAge", "birthdayMonth"
]);

const CHAR_INFO_EX_FEATURE_TYPES = Object.freeze({
    mouthInverted: new Set([0, 1, 4, 5, 7, 11, 13, 24, 27, 29]),
    upperLash1: new Set([0, 1, 4, 19, 23, 28, 30, 54, 59]),
    upperLash2: new Set([20, 24, 29, 40, 42, 58]),
    upperLash3: new Set([35, 46]),
    upperLid: new Set([53, 54, 57]),
    lowerLid: new Set([21, 50, 56])
});
const GLASSES_PRIMARY_COLOR_TYPES = new Set([0, 1, 2, 3, 4, 5, 9, 10, 11, 12]);
const GLASSES_TYPE_PAIRS = Object.freeze([
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    [5, 0], [6, 1], [1, 1], [7, 1], [8, 0],
    [9, 0], [10, 0], [11, 0], [3, 1], [12, 1],
    [6, 2], [1, 2], [7, 2], [3, 2], [12, 2]
]);

const WRINKLE_PRESETS = Object.freeze([
    [[0, 6, 3, 2, 15], [0, 6, 3, 7, 23]],
    [[1, 6, 3, 2, 16], [0, 6, 3, 7, 23]],
    [[0, 6, 3, 2, 15], [1, 6, 1, 7, 23]],
    [[2, 6, 1, 11, 18], [0, 6, 3, 7, 23]],
    [[0, 6, 3, 2, 15], [2, 6, 2, 2, 19]],
    [[0, 6, 3, 2, 15], [3, 6, 2, 4, 20]],
    [[0, 6, 3, 2, 15], [5, 3, 6, 0, 28]],
    [[0, 6, 3, 2, 15], [4, 3, 6, 0, 28]],
    [[6, 6, 4, 1, 11], [0, 6, 3, 7, 23]],
    [[0, 6, 3, 2, 15], [6, 6, 3, 7, 23]],
    [[3, 6, 3, 11, 15], [0, 6, 3, 7, 23]],
    [[5, 6, 3, 2, 15], [7, 6, 3, 7, 23]]
]);

const MAKEUP_PRESETS = Object.freeze([
    [[0, 89, 6, 3, 1, 12], [0, 25, 5, 3, 6, 19]],
    [[0, 89, 6, 3, 1, 12], [1, 35, 5, 4, 6, 21]],
    [[0, 89, 6, 3, 1, 12], [1, 25, 5, 4, 6, 21]],
    [[1, 61, 6, 3, 1, 12], [0, 25, 5, 3, 6, 19]],
    [[0, 89, 6, 3, 1, 12], [2, 35, 5, 3, 6, 19]],
    [[0, 89, 6, 3, 1, 12], [2, 25, 5, 3, 6, 19]],
    [[1, 61, 6, 3, 1, 12], [1, 35, 5, 4, 6, 21]],
    [[1, 19, 6, 3, 1, 12], [1, 35, 5, 4, 6, 21]],
    [[1, 23, 6, 3, 1, 12], [2, 35, 5, 3, 6, 19]],
    [[0, 89, 6, 3, 1, 12], [3, 25, 5, 3, 5, 18]],
    [[0, 89, 6, 3, 1, 12], [0, 25, 5, 3, 6, 19]],
    [[0, 89, 6, 3, 1, 12], [0, 25, 5, 3, 6, 19]]
]);

class MiiConversionError extends Error {
    constructor(message, code = "conversion_failed", report = undefined) {
        super(message);
        this.name = "MiiConversionError";
        this.code = code;
        if (report !== undefined) this.report = report;
    }
}

function asExactBytes(value, expectedLength, field) {
    let bytes;
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
        bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    } else if (value instanceof ArrayBuffer
        || (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer)) {
        bytes = new Uint8Array(value);
    } else if (typeof value === "string" && /^(?:[0-9a-f]{2})*$/i.test(value)) {
        bytes = Uint8Array.from(value.match(/../g) ?? [], byte => Number.parseInt(byte, 16));
    } else {
        throw new TypeError(`${field} must be a Buffer, Uint8Array, ArrayBuffer, or hexadecimal string`);
    }
    if (bytes.length !== expectedLength) {
        throw new MiiConversionError(
            `${field} must be exactly ${expectedLength} bytes, got ${bytes.length}`,
            field === "CharInfo" ? "invalid_char_info" : "invalid_char_info_ex"
        );
    }
    return bytes;
}

function assertValidCharInfoSelectors(source) {
    for (const range of [
        [0x26, 3, "font region"], [0x27, 11, "favorite color"],
        [0x28, 1, "gender"], [0x29, 127, "height"], [0x2a, 127, "build"],
        [0x2b, 1, "special flag"], [0x2c, 3, "region move"], [0x2d, 11, "faceline type"],
        [0x2e, 9, "faceline color"], [0x2f, 11, "wrinkle preset"],
        [0x30, 11, "makeup preset"], [0x31, 131, "hair type"],
        [0x32, 99, "hair color"], [0x33, 1, "hair-flip flag"],
        [0x34, 59, "eye type"], [0x35, 99, "eye color"],
        [0x36, 7, "eye scale"], [0x37, 6, "eye aspect"],
        [0x38, 7, "eye rotation"], [0x39, 12, "eye X"], [0x3a, 18, "eye Y"],
        [0x3b, 23, "eyebrow type"], [0x3c, 99, "eyebrow color"],
        [0x3d, 8, "eyebrow scale"], [0x3e, 6, "eyebrow aspect"],
        [0x3f, 11, "eyebrow rotation"], [0x40, 12, "eyebrow X"],
        [0x41, 18, "encoded eyebrow Y", 3], [0x42, 17, "nose type"],
        [0x43, 8, "nose scale"], [0x44, 18, "nose Y"],
        [0x45, 35, "mouth type"], [0x46, 99, "mouth color"],
        [0x47, 8, "mouth scale"], [0x48, 6, "mouth aspect"], [0x49, 18, "mouth Y"],
        [0x4a, 99, "facial-hair color"], [0x4b, 5, "beard type"],
        [0x4c, 5, "mustache type"], [0x4d, 8, "mustache scale"],
        [0x4e, 16, "mustache Y"], [0x4f, 19, "glasses type"],
        [0x50, 99, "glasses color"], [0x51, 7, "glasses scale"],
        [0x52, 20, "glasses Y"], [0x53, 1, "mole flag"],
        [0x54, 8, "mole scale"], [0x55, 16, "mole X"], [0x56, 30, "mole Y"]
    ]) {
        if (source[range[0]] < (range[3] ?? 0) || source[range[0]] > range[1]) {
            throw new MiiConversionError(
                `invalid CharInfo ${range[2]} ${source[range[0]]} at 0x${range[0].toString(16)} (expected ${range[3] ?? 0}-${range[1]})`,
                "invalid_char_info"
            );
        }
    }
}

/** Recovered title transform; eyebrow Y stays in its external +3 encoding. */
function convertCharInfoToCharInfoEx(value) {
    const source = asExactBytes(value, CHAR_INFO_SIZE, "CharInfo");
    assertValidCharInfoSelectors(source);
    const target = new Uint8Array(CHAR_INFO_EX_SIZE);

    target.set(source.subarray(0x00, 0x26), 0x00);
    target[0x26] = source[0x26];
    target[0x27] = source[0x28];
    target[0x28] = source[0x29];
    target[0x29] = source[0x2a];
    target[0x2a] = source[0x2c];
    target[0x2b] = (source[0x2b] === 1 ? 0x01 : 0)
        | (source[0x33] ? 0x02 : 0)
        | (source[0x34] === 20 ? 0x10 : 0)
        | (CHAR_INFO_EX_FEATURE_TYPES.mouthInverted.has(source[0x45]) ? 0x20 : 0)
        | (source[0x53] ? 0x80 : 0);
    target[0x2c] = source[0x2d];
    target[0x2d] = source[0x2e] + 100;

    target.set(WRINKLE_PRESETS[source[0x2f]][0], 0x2e);
    target.set(WRINKLE_PRESETS[source[0x2f]][1], 0x33);

    target.set(MAKEUP_PRESETS[source[0x30]][0], 0x38);
    target.set(MAKEUP_PRESETS[source[0x30]][1], 0x3e);

    const hairType = source[0x31] === 34 || source[0x31] === 57 ? 45 : source[0x31];
    target[0x44] = hairType & 0xff;
    target[0x45] = hairType >>> 8;
    target[0x46] = source[0x32];
    target[0x47] = source[0x32];
    target[0x48] = 0;
    target[0x49] = 0;
    target[0x4a] = 0;
    target.set([0, 2, 4], 0x4b);
    target.set(source.subarray(0x34, 0x3b), 0x4e);
    target[0x55] = 64;

    const eyeType = source[0x34];
    const eyeAspect = source[0x37];
    if (eyeType === 10) {
        target[0x56] = 3;
        target[0x57] = eyeAspect < 3 ? 6 - 2 * eyeAspect : 0;
        target[0x58] = (eyeAspect + 4) % 7;
        target[0x5c] = 3;
    } else {
        if (CHAR_INFO_EX_FEATURE_TYPES.upperLash1.has(eyeType)) target[0x5c] = 1;
        else if (CHAR_INFO_EX_FEATURE_TYPES.upperLash2.has(eyeType)) target[0x5c] = 2;
        else if (CHAR_INFO_EX_FEATURE_TYPES.upperLash3.has(eyeType)) target[0x5c] = 3;

        if (eyeType === 45) target[0x62] = 1;
        else {
            if (CHAR_INFO_EX_FEATURE_TYPES.upperLid.has(eyeType)) target[0x68] = 1;
            if (CHAR_INFO_EX_FEATURE_TYPES.lowerLid.has(eyeType)) target[0x6e] = 1;
        }
    }

    target.set(source.subarray(0x3b, 0x40), 0x74);
    target[0x79] = source[0x40] + 2;
    target[0x7a] = source[0x41];
    target.set(source.subarray(0x42, 0x45), 0x7b);
    target.set(source.subarray(0x45, 0x49), 0x7e);
    target[0x82] = 0;
    target[0x83] = source[0x49];

    target[0x84] = source[0x4b];
    target[0x85] = source[0x4a];
    target[0x86] = source[0x30] === 10 ? 1 : source[0x30] === 11 ? 2 : 0;
    target[0x87] = 8;
    target[0x88] = source[0x4c];
    target[0x89] = source[0x4a];
    target[0x8a] = source[0x4d];
    target[0x8b] = 3;
    target[0x8c] = source[0x4e];
    if (source[0x4b] === 5) {
        target[0x84] = 0;
        target[0x85] = 8;
        target[0x86] = 4;
        target[0x87] = source[0x4a];
    } else if (source[0x4b] === 4) {
        target[0x84] = 0;
        target[0x85] = 8;
        target[0x86] = source[0x30] === 11 ? 5 : 3;
        target[0x87] = source[0x4a];
    }

    const glassPair = GLASSES_TYPE_PAIRS[source[0x4f]];
    target[0x8d] = glassPair[0];
    target[0x8f] = source[0x51];
    target[0x90] = 3;
    target[0x91] = source[0x52];
    target[0x92] = glassPair[1];
    if (GLASSES_PRIMARY_COLOR_TYPES.has(source[0x4f])) {
        target[0x8e] = source[0x50];
        target[0x93] = 8;
    } else {
        target[0x8e] = 8;
        target[0x93] = source[0x50];
    }

    target.set(source.subarray(0x54, 0x57), 0x94);
    target[0x97] = 45;
    return Buffer.from(target);
}

function differingByteOffsets(left, right) {
    const offsets = [];
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (left[i] !== right[i]) offsets.push(i);
    }
    return offsets;
}

function clampInteger(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Number.isInteger(value) ? value : minimum));
}

function uniqueValid(values, minimum, maximum) {
    return [...new Set(values.filter(value => Number.isInteger(value) && value >= minimum && value <= maximum))];
}

function normalizeOptionalInteger(value, minimum, maximum, field) {
    if (value === undefined) return undefined;
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new MiiConversionError(
            `${field} must be an integer from ${minimum} through ${maximum}`,
            "invalid_conversion_option"
        );
    }
    return value;
}

function inverseCandidateSummary(bytes) {
    return {
        favoriteColor: bytes[0x27],
        faceFeature: bytes[0x2f],
        makeup: bytes[0x30],
        hairType: bytes[0x31],
        beardColor: bytes[0x4a],
        beardType: bytes[0x4b],
        glassesType: bytes[0x4f],
        glassesColor: bytes[0x50],
        unknown: bytes[0x57]
    };
}

/** Project LTD CharInfoEx through the reviewed legacy-selector tables. */
function projectReviewedLtdCharInfoToCharInfo(value, options = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
        throw new MiiConversionError("reviewed projection options must be an object", "invalid_conversion_option");
    }
    if (reviewedLtdCharInfoBackport.schemaVersion !== 2 || !reviewedLtdCharInfoBackport.complete) {
        throw new Error("the bundled LTD to CHARINFO review table is incomplete or unsupported");
    }
    const source = isByteInput(value)
        ? parseCharInfoEx(asExactBytes(value, CHAR_INFO_EX_SIZE, "CharInfoEx"))
        : value?.fields?.ltd?.charInfo ?? value?.ltd?.charInfo ?? value?.charInfo ?? value;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
        throw new MiiConversionError("reviewed LTD projection requires a CharInfoEx record", "invalid_ltd_char_info");
    }

    const facelineType = reviewedLtdCharInfoBackport.tables.face.facelineType[source.facelineType];
    const facelineColor = reviewedLtdCharInfoBackport.tables.colors.facelineColor[source.facelineColor];
    const eyeType = reviewedLtdCharInfoBackport.tables.eyes.eyeType[source.eyeType];
    const eyebrowType = reviewedLtdCharInfoBackport.tables.eyebrows.eyebrowType[source.eyebrowType];
    const noseType = reviewedLtdCharInfoBackport.tables.nose.noseType[source.noseType];
    const mouthType = reviewedLtdCharInfoBackport.tables.mouth.mouthType[source.mouthType];
    const mustacheType = reviewedLtdCharInfoBackport.tables.mustache.mustacheType[source.mustacheType];
    const hairFront = reviewedLtdCharInfoBackport.tables.hair.hairFrontType[source.hairFrontType];
    const glassesType = reviewedLtdCharInfoBackport.tables.glasses["glassPrimaryType+glassLensMaterialMode"][
        `${source.glassPrimaryType},${source.glassLensMaterialMode}`
    ];
    const fullBeard = reviewedLtdCharInfoBackport.tables.beard.beardType[source.beardType];
    const stubble = reviewedLtdCharInfoBackport.tables.beard.stubbleType[source.stubbleType];
    const makeupUpper = reviewedLtdCharInfoBackport.tables.makeup.makeupUpperType[source.makeupUpperType];
    const makeupLower = reviewedLtdCharInfoBackport.tables.makeup.makeupLowerType[source.makeupLowerType];
    const wrinkleUpper = reviewedLtdCharInfoBackport.tables.wrinkles.wrinkleUpperType[source.wrinkleUpperType];
    const wrinkleLower = reviewedLtdCharInfoBackport.tables.wrinkles.wrinkleLowerType[source.wrinkleLowerType];
    if (!facelineType) throw new MiiConversionError(
        `LTD facelineType selector ${source.facelineType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!facelineColor) throw new MiiConversionError(
        `LTD facelineColor selector ${source.facelineColor} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!eyeType) throw new MiiConversionError(
        `LTD eyeType selector ${source.eyeType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!eyebrowType) throw new MiiConversionError(
        `LTD eyebrowType selector ${source.eyebrowType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!noseType) throw new MiiConversionError(
        `LTD noseType selector ${source.noseType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!mouthType) throw new MiiConversionError(
        `LTD mouthType selector ${source.mouthType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!mustacheType) throw new MiiConversionError(
        `LTD mustacheType selector ${source.mustacheType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!hairFront) throw new MiiConversionError(
        `LTD hairFrontType selector ${source.hairFrontType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!glassesType) throw new MiiConversionError(
        `LTD glasses selectors ${source.glassPrimaryType},${source.glassLensMaterialMode} have no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!fullBeard) throw new MiiConversionError(
        `LTD beardType selector ${source.beardType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!stubble) throw new MiiConversionError(
        `LTD stubbleType selector ${source.stubbleType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!makeupUpper) throw new MiiConversionError(
        `LTD makeupUpperType selector ${source.makeupUpperType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!makeupLower) throw new MiiConversionError(
        `LTD makeupLowerType selector ${source.makeupLowerType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!wrinkleUpper) throw new MiiConversionError(
        `LTD wrinkleUpperType selector ${source.wrinkleUpperType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    if (!wrinkleLower) throw new MiiConversionError(
        `LTD wrinkleLowerType selector ${source.wrinkleLowerType} has no reviewed CHARINFO mapping`,
        "unsupported_ltd_selector"
    );
    for (const field of reviewedLtdCharInfoBackport.identityColorFields) {
        if (!Number.isInteger(source[field]) || source[field] < 0 || source[field] > 99) {
            throw new MiiConversionError(
                `LTD ${field} selector ${source[field]} has no reviewed CHARINFO mapping`,
                "unsupported_ltd_selector"
            );
        }
    }

    const data = Buffer.from(
        "000000000000400080000000000000006e006f0020006e0061006d006500000000000000000000000040400000000000002101000208040304020c0601040306020a010409171304030d080000040a0008040a0004021400",
        "hex"
    );
    data.set(normalizeCreateId(source.uuidRaw ?? source.uuid).bytes, 0x00);
    data.set(asExactBytes(source.nameBytes, 22, "LTD CharInfoEx nameBytes"), 0x10);
    data[0x26] = clampInteger(source.fontRegion, 0, 3);
    data[0x27] = normalizeOptionalInteger(options.favoriteColor, 0, 11, "favoriteColor") ?? 0;
    data[0x28] = clampInteger(source.gender, 0, 1);
    data[0x29] = clampInteger(source.height, 0, 127);
    data[0x2a] = clampInteger(source.build, 0, 127);
    data[0x2b] = source.faceFlagsRaw & 0x01 ? 1 : 0;
    data[0x2c] = clampInteger(source.regionMove, 0, 3);
    data[0x2d] = facelineType.patch["face.type"];
    data[0x2e] = facelineColor.patch["face.color"];

    data[0x2f] = source.wrinkleUpperType !== 0 && source.wrinkleLowerType !== 0
        ? 11
        : source.wrinkleUpperType !== 0
            ? wrinkleUpper.patch["face.feature"]
            : wrinkleLower.patch["face.feature"];

    data[0x30] = source.stubbleType !== 0 && Object.hasOwn(stubble.patch, "face.makeup")
        ? stubble.patch["face.makeup"]
        : 0;
    if (source.makeupUpperType !== 0 && source.makeupLowerType !== 0) {
        data[0x30] = 6;
    } else if (source.makeupUpperType !== 0) {
        data[0x30] = makeupUpper.patch["face.makeup"];
    } else if (source.makeupLowerType !== 0) {
        data[0x30] = makeupLower.patch["face.makeup"];
    }

    const useBangs = source.hairFrontType !== 0 && Object.hasOwn(hairFront.patch, "hair.type");
    const hairBack = useBangs
        ? null
        : reviewedLtdCharInfoBackport.tables.hair.hairType[source.hairType];
    if (!useBangs && !hairBack) {
        throw new MiiConversionError(
            `LTD hairType selector ${source.hairType} has no reviewed CHARINFO Back/base mapping and no usable Bangs mapping`,
            "unsupported_ltd_selector"
        );
    }
    data[0x31] = useBangs ? hairFront.patch["hair.type"] : hairBack.patch["hair.type"];
    data[0x32] = source[
        useBangs
            ? (source.faceFlagsRaw & 0x08 ? "hairColorSecondary" : "hairColorPrimary")
            : (source.faceFlagsRaw & 0x04 ? "hairColorSecondary" : "hairColorPrimary")
    ];
    data[0x33] = source.faceFlagsRaw & 0x02 ? 1 : 0;

    data[0x34] = eyeType.patch["eyes.type"];
    data[0x35] = source.eyeColor;
    data[0x36] = eyeType.patch["eyes.size"] ?? clampInteger(source.eyeScale, 0, 7);
    data[0x37] = eyeType.patch["eyes.squash"] ?? clampInteger(source.eyeAspect, 0, 6);
    data[0x38] = clampInteger(source.eyeRotate, 0, 7);
    data[0x39] = eyeType.patch["eyes.distanceApart"] ?? clampInteger(source.eyeX, 0, 12);
    data[0x3a] = eyeType.patch["eyes.yPosition"] ?? clampInteger(source.eyeY, 0, 18);

    data[0x3b] = eyebrowType.patch["eyebrows.type"];
    data[0x3c] = source.eyebrowColor;
    data[0x3d] = eyebrowType.patch["eyebrows.size"] ?? clampInteger(source.eyebrowScale, 0, 8);
    data[0x3e] = eyebrowType.patch["eyebrows.squash"] ?? clampInteger(source.eyebrowAspect, 0, 6);
    data[0x3f] = clampInteger(source.eyebrowRotate, 0, 11);
    data[0x40] = eyebrowType.patch["eyebrows.distanceApart"] ?? clampInteger(source.eyebrowX - 2, 0, 12);
    data[0x41] = Object.hasOwn(eyebrowType.patch, "eyebrows.yPosition")
        ? eyebrowType.patch["eyebrows.yPosition"] + 3
        : clampInteger(source.eyebrowY, 3, 18);

    data[0x42] = noseType.patch["nose.type"];
    data[0x43] = noseType.patch["nose.size"] ?? clampInteger(source.noseScale, 0, 8);
    data[0x44] = noseType.patch["nose.yPosition"] ?? clampInteger(source.noseY, 0, 18);

    data[0x45] = mouthType.patch["mouth.type"];
    data[0x46] = source.mouthColor;
    data[0x47] = mouthType.patch["mouth.size"] ?? clampInteger(source.mouthScale, 0, 8);
    data[0x48] = mouthType.patch["mouth.squash"] ?? clampInteger(source.mouthAspect, 0, 6);
    data[0x49] = mouthType.patch["mouth.yPosition"] ?? clampInteger(source.mouthY, 0, 18);

    data[0x4b] = source.stubbleType !== 0 && Object.hasOwn(stubble.patch, "beard.type")
        ? stubble.patch["beard.type"]
        : fullBeard.patch["beard.type"];
    if (source.beardType !== 0) data[0x4b] = fullBeard.patch["beard.type"];
    data[0x4a] = source.beardType !== 0
        ? source.beardColor
        : source.stubbleType !== 0 && Object.hasOwn(stubble.patch, "beard.type")
            ? source.stubbleColor
            : source.mustacheType !== 0
                ? source.mustacheColor
                : source.beardColor;
    data[0x4c] = mustacheType.patch["beard.mustache.type"];
    data[0x4d] = mustacheType.patch["beard.mustache.size"] ?? clampInteger(source.mustacheScale, 0, 8);
    data[0x4e] = mustacheType.patch["beard.mustache.yPosition"] ?? clampInteger(source.mustacheY, 0, 16);

    data[0x4f] = glassesType.patch["glasses.type"];
    data[0x50] = GLASSES_PRIMARY_COLOR_TYPES.has(data[0x4f])
        ? source.glassPrimaryColor
        : source.glassLensColor;
    data[0x51] = glassesType.patch["glasses.size"] ?? clampInteger(source.glassScale, 0, 7);
    data[0x52] = glassesType.patch["glasses.yPosition"] ?? clampInteger(source.glassY, 0, 20);
    data[0x53] = source.faceFlagsRaw & 0x80 ? 1 : 0;
    data[0x54] = clampInteger(source.moleScale, 0, 8);
    data[0x55] = clampInteger(source.moleX, 0, 16);
    data[0x56] = clampInteger(source.moleY, 0, 30);
    data[0x57] = normalizeOptionalInteger(options.unknownByte57, 0, 255, "unknownByte57") ?? 0;
    assertValidCharInfoSelectors(data);
    return data;
}

/** Prove a CharInfoEx inverse by regenerating and comparing all 152 bytes. */
function analyzeCharInfoExInverse(value, options = {}) {
    const source = asExactBytes(value, CHAR_INFO_EX_SIZE, "CharInfoEx");
    const template = options.legacyTemplate === undefined
        ? undefined
        : asExactBytes(options.legacyTemplate, CHAR_INFO_SIZE, "CharInfo").slice();
    if (template !== undefined) assertValidCharInfoSelectors(template);

    const explicitFavoriteColor = normalizeOptionalInteger(options.favoriteColor, 0, 11, "favoriteColor");
    const explicitHairHint = normalizeOptionalInteger(options.hairHint, 0, 131, "hairHint");
    const explicitUnknownByte = normalizeOptionalInteger(options.unknownByte57, 0, 255, "unknownByte57");
    if (template !== undefined && explicitFavoriteColor !== undefined && template[0x27] !== explicitFavoriteColor) {
        throw new MiiConversionError(
            "favoriteColor conflicts with legacyTemplate byte 0x27",
            "conflicting_conversion_input"
        );
    }
    if (template !== undefined && explicitHairHint !== undefined && template[0x31] !== explicitHairHint) {
        throw new MiiConversionError(
            "hairHint conflicts with legacyTemplate byte 0x31",
            "conflicting_conversion_input"
        );
    }
    if (template !== undefined && explicitUnknownByte !== undefined && template[0x57] !== explicitUnknownByte) {
        throw new MiiConversionError(
            "unknownByte57 conflicts with legacyTemplate byte 0x57",
            "conflicting_conversion_input"
        );
    }

    const favoriteColor = explicitFavoriteColor ?? template?.[0x27];
    const hairHint = explicitHairHint ?? template?.[0x31];
    const unknownByte = explicitUnknownByte ?? template?.[0x57];
    const templateVerification = template === undefined
        ? undefined
        : differingByteOffsets(convertCharInfoToCharInfoEx(template), source);

    if (templateVerification?.length === 0) {
        return {
            exact: true,
            fullySpecified: true,
            charInfo: Buffer.from(template),
            candidateCount: 1,
            candidates: [{ ...inverseCandidateSummary(template), data: Buffer.from(template) }],
            missingFields: [],
            ambiguities: [],
            verification: {
                strategy: "regenerate-and-compare",
                comparedBytes: CHAR_INFO_EX_SIZE,
                exact: true,
                templateMismatchOffsets: []
            }
        };
    }

    const base = new Uint8Array(CHAR_INFO_SIZE);
    base.set(source.subarray(0x00, 0x26), 0x00);
    base[0x26] = clampInteger(source[0x26], 0, 3);
    base[0x27] = favoriteColor ?? 0;
    base[0x28] = clampInteger(source[0x27], 0, 1);
    base[0x29] = clampInteger(source[0x28], 0, 127);
    base[0x2a] = clampInteger(source[0x29], 0, 127);
    base[0x2b] = source[0x2b] & 0x01 ? 1 : 0;
    base[0x2c] = clampInteger(source[0x2a], 0, 3);
    base[0x2d] = clampInteger(source[0x2c], 0, 11);
    base[0x2e] = clampInteger(source[0x2d] - 100, 0, 9);
    base[0x32] = clampInteger(source[0x46], 0, 99);
    base[0x33] = source[0x2b] & 0x02 ? 1 : 0;
    for (const offsets of [
        [0x34, 0x4e, 59], [0x35, 0x4f, 99], [0x36, 0x50, 7],
        [0x37, 0x51, 6], [0x38, 0x52, 7], [0x39, 0x53, 12],
        [0x3a, 0x54, 18], [0x3b, 0x74, 23], [0x3c, 0x75, 99],
        [0x3d, 0x76, 8], [0x3e, 0x77, 6], [0x3f, 0x78, 11],
        [0x41, 0x7a, 18, 3], [0x42, 0x7b, 17], [0x43, 0x7c, 8],
        [0x44, 0x7d, 18], [0x45, 0x7e, 35], [0x46, 0x7f, 99],
        [0x47, 0x80, 8], [0x48, 0x81, 6], [0x49, 0x83, 18],
        [0x4c, 0x88, 5], [0x4d, 0x8a, 8], [0x4e, 0x8c, 16],
        [0x51, 0x8f, 7], [0x52, 0x91, 20], [0x54, 0x94, 8],
        [0x55, 0x95, 16], [0x56, 0x96, 30]
    ]) {
        base[offsets[0]] = clampInteger(source[offsets[1]], offsets[3] ?? 0, offsets[2]);
    }
    base[0x40] = clampInteger(source[0x79] - 2, 0, 12);
    base[0x53] = source[0x2b] & 0x80 ? 1 : 0;
    base[0x57] = unknownByte ?? 0;

    const encodedHairType = source[0x44] | (source[0x45] << 8);
    let hairTypes;
    if (encodedHairType === 45) hairTypes = [34, 45, 57];
    else if (encodedHairType <= 131) hairTypes = [encodedHairType];
    else hairTypes = [131]; // diagnostic candidate only; exact comparison must fail
    if (hairHint !== undefined) hairTypes = hairTypes.filter(value => value === hairHint);

    const glassesMatches = [];
    for (let type = 0; type < GLASSES_TYPE_PAIRS.length; type++) {
        const glassPair = GLASSES_TYPE_PAIRS[type];
        if (
            glassPair[0] === source[0x8d]
            && glassPair[1] === source[0x92]
        ) glassesMatches.push(type);
    }
    const beardColors = uniqueValid([source[0x85], source[0x87], source[0x89]], 0, 99);
    if (beardColors.length === 0) beardColors.push(0);
    const glassesColors = uniqueValid([source[0x8e], source[0x93]], 0, 99);
    if (glassesColors.length === 0) glassesColors.push(0);

    const exactCandidates = [];
    let bestMismatchOffsets = null;
    let bestCandidate = null;
    for (let faceFeature = 0; faceFeature < WRINKLE_PRESETS.length; faceFeature++) {
        for (let makeup = 0; makeup < MAKEUP_PRESETS.length; makeup++) {
            for (const hairType of hairTypes) {
                for (let beardType = 0; beardType <= 5; beardType++) {
                    for (const beardColor of beardColors) {
                        for (const glassesType of glassesMatches.length ? glassesMatches : [0]) {
                            for (const glassesColor of glassesColors) {
                                const candidate = base.slice();
                                candidate[0x2f] = faceFeature;
                                candidate[0x30] = makeup;
                                candidate[0x31] = hairType;
                                candidate[0x4a] = beardColor;
                                candidate[0x4b] = beardType;
                                candidate[0x4f] = glassesType;
                                candidate[0x50] = glassesColor;
                                const mismatchOffsets = differingByteOffsets(convertCharInfoToCharInfoEx(candidate), source);
                                if (bestMismatchOffsets === null || mismatchOffsets.length < bestMismatchOffsets.length) {
                                    bestMismatchOffsets = mismatchOffsets;
                                    bestCandidate = candidate;
                                }
                                if (mismatchOffsets.length === 0) exactCandidates.push(candidate);
                            }
                        }
                    }
                }
            }
        }
    }

    const ambiguities = [];
    for (const ambiguousField of [
        [0x2f, "faceFeature"], [0x30, "makeup"], [0x31, "hairType"],
        [0x4a, "beardColor"], [0x4b, "beardType"], [0x4f, "glassesType"],
        [0x50, "glassesColor"]
    ]) {
        const values = [...new Set(exactCandidates.map(candidate => candidate[ambiguousField[0]]))]
            .sort((a, b) => a - b);
        if (values.length > 1) ambiguities.push({ field: ambiguousField[1], values });
    }
    const missingFields = [];
    if (favoriteColor === undefined) missingFields.push("favoriteColor");
    if (exactCandidates.length && ambiguities.length) {
        if (ambiguities.some(ambiguity => ambiguity.field === "hairType")) missingFields.push("hairHint");
        if (ambiguities.some(ambiguity => ambiguity.field !== "hairType")) missingFields.push("matchingLegacyTemplate");
    }
    if (unknownByte === undefined) missingFields.push("unknownByte57");
    if (templateVerification?.length && !missingFields.includes("matchingLegacyTemplate")) {
        missingFields.push("matchingLegacyTemplate");
    }
    const fullySpecified = exactCandidates.length === 1 && missingFields.length === 0;
    const selected = fullySpecified ? exactCandidates[0] : null;
    return {
        exact: exactCandidates.length > 0,
        fullySpecified,
        charInfo: selected === null ? null : Buffer.from(selected),
        candidateCount: exactCandidates.length,
        candidates: exactCandidates.map(candidate => ({
            ...inverseCandidateSummary(candidate),
            data: favoriteColor === undefined || unknownByte === undefined ? undefined : Buffer.from(candidate)
        })),
        missingFields,
        ambiguities,
        verification: {
            strategy: "regenerate-and-compare",
            comparedBytes: CHAR_INFO_EX_SIZE,
            exact: exactCandidates.length > 0,
            bestMismatchOffsets: bestMismatchOffsets ?? [],
            templateMismatchOffsets: templateVerification,
            bestCandidate: bestCandidate === null ? undefined : inverseCandidateSummary(bestCandidate)
        }
    };
}

function summarizedValue(value) {
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) return { byteLength: value.byteLength };
    if (Array.isArray(value) && value.length > 16) return { elementCount: value.length };
    return value;
}

function reportField(report, bucket, code, details = {}) {
    const record = { code, ...details };
    if (Object.hasOwn(record, "sourceValue")) record.sourceValue = summarizedValue(record.sourceValue);
    if (Object.hasOwn(record, "targetValue")) record.targetValue = summarizedValue(record.targetValue);
    report.fields[bucket].push(record);
    return record;
}

function rejectConversion(report, code, message) {
    report.status = "rejected";
    throw new MiiConversionError(message, code, report);
}

function normalizeFormat(value, field) {
    if (typeof value !== "string") {
        throw new MiiConversionError(`${field} must be a Mii format string`, "invalid_conversion_format");
    }
    const normalized = value.toLowerCase().replaceAll(".", "");
    if (![MiiFormats.RCD, MiiFormats.RSD, MiiFormats.CHARINFO, MiiFormats.LTD].includes(normalized)) {
        throw new MiiConversionError(
            `unsupported ${field} ${value}; supported conversion formats are RCD, RSD, CHARINFO, and LTD`,
            "unsupported_conversion"
        );
    }
    return normalized;
}

function isByteInput(value) {
    return Buffer.isBuffer(value) || value instanceof Uint8Array || value instanceof ArrayBuffer
        || (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer)
        || (typeof value === "string" && /^(?:[0-9a-f]{2})*$/i.test(value));
}

function copyBytes(value, field) {
    if (typeof value === "string") return Buffer.from(value, "hex");
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
        return Buffer.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
    }
    if (value instanceof ArrayBuffer
        || (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer)) {
        return Buffer.from(new Uint8Array(value));
    }
    throw new TypeError(`${field} must be bytes`);
}

function normalizeCreateId(value, { generate = false } = {}) {
    let bytes;
    if (value === undefined) {
        if (!generate) {
            throw new MiiConversionError("createId is required", "missing_create_id");
        }
        bytes = Buffer.from(randomBytes(16));
        // RFC v4 is a valid subset of Nintendo's broader CreateId rules.
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
    } else if (typeof value === "string") {
        const compact = value.replaceAll("-", "");
        if (!/^[0-9a-f]{32}$/i.test(compact)) {
            throw new MiiConversionError("createId must contain exactly 16 hexadecimal bytes", "invalid_create_id");
        }
        bytes = Buffer.from(compact, "hex");
    } else {
        bytes = copyBytes(value, "createId");
        if (bytes.length !== 16) {
            throw new MiiConversionError(`createId must be exactly 16 bytes, got ${bytes.length}`, "invalid_create_id");
        }
    }
    let nonzero = 0;
    for (const byte of bytes) nonzero |= byte;
    if (nonzero === 0 || (bytes[8] & 0xc0) !== 0x80) {
        throw new MiiConversionError(
            "createId must be nonzero and have UUID byte 8 variant bits 10",
            "invalid_create_id"
        );
    }
    return { bytes, generated: value === undefined };
}

function crc16(data, current = 0x0000) {
    let crc = current;
    for (const byte of data) {
        for (let bit = 7; bit >= 0; bit--) {
            crc = ((crc << 1) | ((byte >> bit) & 1)) & 0x1ffff;
            if (crc & 0x10000) crc ^= 0x1021;
        }
    }
    for (let i = 0; i < 16; i++) {
        crc = (crc << 1) & 0x1ffff;
        if (crc & 0x10000) crc ^= 0x1021;
    }
    return crc & 0xffff;
}

function validateRsdChecksum(bytes) {
    if (bytes.length !== 0x4c) return;
    const expected = crc16(bytes.subarray(0, 0x4a));
    const actual = bytes.readUInt16BE(0x4a);
    if (actual !== expected) {
        throw new MiiConversionError(
            `invalid RSD CRC16: expected 0x${expected.toString(16).padStart(4, "0")}, got 0x${actual.toString(16).padStart(4, "0")}`,
            "invalid_rsd_checksum"
        );
    }
}

function rcdToCharInfo(value, createId) {
    const source = Buffer.from(value);
    if (source.length !== 0x4a && source.length !== 0x4c) {
        throw new MiiConversionError("RCD/RSD input must be 74 or 76 bytes", "invalid_legacy_template");
    }
    const sourceFormat = source.length === 0x4c ? MiiFormats.RSD : MiiFormats.RCD;
    if (!isMiiInFormat(source, sourceFormat)) {
        throw new MiiConversionError(`input is not valid ${sourceFormat.toUpperCase()} data`, "invalid_legacy_mii");
    }
    if (sourceFormat === MiiFormats.RSD) validateRsdChecksum(source);
    const canonical = structuredClone(decodeMii(source));
    canonical.meta ??= {};
    canonical.meta.charset = 0;
    canonical.meta.region = 0;
    canonical.eyes ??= {};
    canonical.eyebrows ??= {};
    canonical.mouth ??= {};
    canonical.eyes.squash = 3;
    canonical.eyebrows.squash = 3;
    canonical.mouth.squash = 3;
    const charInfo = Buffer.from(encodeMii(canonical, MiiFormats.CHARINFO));
    charInfo.set(createId, 0x00);
    charInfo[0x26] = 0;
    // RFL/Ver3 special and foreign identity bits do not map to Switch appearance.
    charInfo[0x2b] = 0;
    charInfo[0x2c] = 0;
    charInfo[0x37] = 3;
    charInfo[0x3e] = 3;
    charInfo[0x48] = 3;
    charInfo[0x57] = 0;
    assertValidCharInfoSelectors(charInfo);
    return charInfo;
}

function loveGenderFromRaw(value, version) {
    const raw = Array.from(copyBytes(value, "ltdProfile.loveGenderRaw"));
    const expected = version === 2 ? 3 : 4;
    if (raw.length !== expected) {
        throw new MiiConversionError(
            `ltdProfile.loveGenderRaw must contain ${expected} bytes for LTD v${version}`,
            "invalid_ltd_profile"
        );
    }
    return {
        male: Boolean(raw[0]),
        female: Boolean(raw[1]),
        third: Boolean(raw[2]),
        raw: raw.slice(),
        sourceRaw: raw.slice(),
        serializedLength: expected,
        ...(version === 3 ? { uninterpretedFourthByte: raw[3] } : {})
    };
}

function profilePayload(value, field) {
    return copyBytes(value?.data ?? value, field);
}

function requireProfileField(profile, key, report) {
    if (profile[key] === undefined) {
        reportField(report, "required", `missing_ltd_profile_${key}`, {
            targetPath: `ltd.${key}`,
            reversible: false,
            provenance: "caller-required"
        });
        rejectConversion(report, "incomplete_ltd_profile", `ltdProfile.${key} is required`);
    }
    return profile[key];
}

function validateProfileHeaderKeys(header, version, report) {
    const unsupported = Object.keys(header).filter(key => ![
        "version", "hasCanvas", "hasUgcTexture", "reserved", "charInfoLength", "legacyPadding"
    ].includes(key));
    if (unsupported.length) {
        rejectConversion(
            report,
            "invalid_ltd_profile",
            `unsupported ltdProfile.header field${unsupported.length === 1 ? "" : "s"}: ${unsupported.join(", ")}`
        );
    }
    if (version !== 2 && Object.prototype.hasOwnProperty.call(header, "legacyPadding")) {
        rejectConversion(
            report,
            "conflicting_ltd_profile",
            "ltdProfile.header.legacyPadding is serialized only by LTD v2"
        );
    }
}


function nestedSourceValue(source, path) {
    let current = source;
    for (const part of path.split(".")) {
        if (current === null || typeof current !== "object"
            || !Object.prototype.hasOwnProperty.call(current, part)) {
            return { present: false, value: undefined };
        }
        current = current[part];
    }
    return { present: true, value: current };
}

function assertDecodedSource(source, sourceFormat, roundTrip) {
    const byPath = new Map();
    for (const field of formats[sourceFormat].struct ?? []) {
        if (!field.name) continue;
        const path = mappings[field.name];
        if (path === undefined || path === "SKIP") continue;
        if (!byPath.has(path)) byPath.set(path, field);
    }
    if (sourceFormat === MiiFormats.RCD || sourceFormat === MiiFormats.RSD) {
        for (const path of ["meta.type", "meta.creationTimestamp", "face.makeup"]) {
            if (!byPath.has(path)) byPath.set(path, { derivedConversionDependency: true });
        }
    }
    for (const [path, formatField] of byPath) {
        const original = nestedSourceValue(source, path);
        if (roundTrip === undefined) {
            if (!original.present || original.value === undefined || original.value === null) {
                throw new MiiConversionError(
                    `decoded ${sourceFormat.toUpperCase()} source is missing required field ${path}`,
                    "invalid_conversion_input"
                );
            }
            continue;
        }
        const encoded = nestedSourceValue(roundTrip, path);
        let equal = typeof original.value === typeof encoded.value;
        if (equal && (original.value instanceof Date || encoded.value instanceof Date)) {
            equal = original.value instanceof Date
                && encoded.value instanceof Date
                && Number.isFinite(original.value.getTime())
                && original.value.getTime() === encoded.value.getTime();
        } else if (equal && formatField.hex && typeof original.value === "string") {
            equal = original.value.replace(/[^0-9a-f]/gi, "").toLowerCase()
                === encoded.value.replace(/[^0-9a-f]/gi, "").toLowerCase();
        } else if (equal) {
            equal = Object.is(original.value, encoded.value);
        }
        if (!encoded.present || !equal) {
            throw new MiiConversionError(
                `decoded ${sourceFormat.toUpperCase()} field ${path} would be defaulted, coerced, truncated, or changed during encoding`,
                "invalid_conversion_input"
            );
        }
    }
}

async function convertConversionEdge(edge, source, targetFormat, mode, options, report) {
    if (edge === "forward") {
        let charInfo;
        if (source.format === MiiFormats.CHARINFO) {
            if (options.createId !== undefined) {
                rejectConversion(report, "unused_conversion_option", "createId is only used for legacy RCD/RSD sources");
            }
            charInfo = Buffer.from(source.data);
            reportField(report, "copied", "preserved_char_info_create_id", {
                sourcePath: "CharInfo[0x00..0x0f]", targetPath: "ltd.charInfo.uuidRaw",
                reversible: true, provenance: "local-title-decomp-FUN_7101d69220"
            });
        } else {
            const createId = normalizeCreateId(options.createId, { generate: options.createId === undefined });
            charInfo = rcdToCharInfo(source.data, createId.bytes);
            reportField(report, createId.generated ? "generated" : "overridden", createId.generated
                ? "generated_switch_create_id_rfc4122_v4"
                : "caller_supplied_switch_create_id", {
                sourcePath: createId.generated ? undefined : "options.createId",
                targetPath: "CharInfo[0x00..0x0f]",
                targetValue: { byteLength: 16 },
                reversible: false,
                provenance: createId.generated ? "platform-csprng" : "caller"
            });
            for (const defaultedField of [["CharInfo.fontRegion", 0], ["CharInfo.regionMove", 0]]) {
                reportField(report, "defaulted", "ffl_legacy_region_zero", {
                    targetPath: defaultedField[0],
                    targetValue: defaultedField[1],
                    reversible: true,
                    provenance: "FFLiMiiData.cpp-a784e6c"
                });
            }
            for (const generatedField of [
                ["eyes.squash", "CharInfo.eyeAspect"],
                ["eyebrows.squash", "CharInfo.eyebrowAspect"],
                ["mouth.squash", "CharInfo.mouthAspect"]
            ]) {
                reportField(report, "generated", "ffl_legacy_aspect_3", {
                    sourcePath: generatedField[0],
                    targetPath: generatedField[1],
                    targetValue: 3,
                    reversible: true, provenance: "FFLiMiiData.cpp-a784e6c"
                });
            }
            reportField(report, "transformed", "ffl_rcd_to_char_info_bridge", {
                sourcePath: source.format, targetPath: "CharInfo",
                reversible: true, provenance: "FFLiMiiData.cpp-a784e6c+MiiPort-15a3032"
            });
        }

        const charInfoEx = convertCharInfoToCharInfoEx(charInfo);
        const inverseShape = analyzeCharInfoExInverse(charInfoEx, {
            favoriteColor: charInfo[0x27],
            unknownByte57: charInfo[0x57]
        });
        if (inverseShape.ambiguities.length) {
            report.summary.appearanceSelectorLossless = false;
            for (const ambiguity of inverseShape.ambiguities) {
                reportField(report, "transformed", "ambiguous_forward_selector_projection", {
                    sourcePath: `CharInfo.${ambiguity.field}`,
                    targetPath: "ltd.charInfo",
                    sourceValue: charInfo[
                        ({ faceFeature: 0x2f, makeup: 0x30, hairType: 0x31, beardColor: 0x4a,
                            beardType: 0x4b, glassesType: 0x4f, glassesColor: 0x50 })[ambiguity.field]
                    ],
                    targetValue: { inverseCandidates: ambiguity.values },
                    reversible: false,
                    provenance: "regenerate-and-compare"
                });
            }
        }
        report.summary.semanticLossless = false;
        report.summary.byteReversible = false;
        reportField(report, "dropped", "favorite_color_not_in_ltd", {
            sourcePath: source.format === MiiFormats.CHARINFO ? "CharInfo[0x27]" : "general.favoriteColor",
            sourceValue: charInfo[0x27],
            reversible: false,
            provenance: "local-title-decomp-FUN_7101d69220"
        });
        reportField(report, "dropped", "char_info_reserved_byte_not_in_ex", {
            sourcePath: "CharInfo[0x57]",
            sourceValue: charInfo[0x57],
            reversible: false,
            provenance: "local-title-decomp-FUN_7101d69220"
        });
        if (charInfo[0x31] === 34 || charInfo[0x31] === 57) {
            report.summary.appearanceSelectorLossless = false;
            reportField(report, "transformed", "collapsed_legacy_hair_selector", {
                sourcePath: "CharInfo.hairType",
                targetPath: "ltd.charInfo.hairType",
                sourceValue: charInfo[0x31],
                targetValue: 45,
                reversible: false,
                provenance: "local-title-decomp-FUN_7101d69220"
            });
        }
        if (source.format === MiiFormats.RCD || source.format === MiiFormats.RSD) {
            for (const droppedField of [
                ["legacy_create_id_not_preservable", "meta.miiId", source.fields?.meta?.miiId],
                ["legacy_system_id_not_in_ltd", "meta.systemId", source.fields?.meta?.systemId],
                ["legacy_creator_name_not_in_ltd", "meta.creatorName", source.fields?.meta?.creatorName],
                ["legacy_special_foreign_identity_not_preservable", "meta.type", source.fields?.meta?.type],
                ["legacy_favorite_flag_not_in_ltd", "perms.favorited", source.fields?.perms?.favorited],
                ["legacy_mingle_not_in_ltd", "perms.mingle", source.fields?.perms?.mingle],
                ["legacy_cmoc_flag_not_in_ltd", "perms.fromCheckMiiOut", source.fields?.perms?.fromCheckMiiOut]
            ]) {
                reportField(report, "dropped", droppedField[0], {
                    sourcePath: droppedField[1],
                    sourceValue: droppedField[2],
                    reversible: false,
                    provenance: "format-boundary"
                });
            }
        }
        reportField(report, "transformed", "title_char_info_to_char_info_ex", {
            sourcePath: "CharInfo", targetPath: "ltd.charInfo",
            reversible: false, provenance: "local-title-decomp-FUN_7101d69220"
        });
        if (mode === "exact") {
            rejectConversion(
                report,
                "lossy_conversion",
                "exact conversion is impossible because LTD omits favorite color and legacy metadata"
            );
        }

        const sourceOverlay = source.format === MiiFormats.RCD || source.format === MiiFormats.RSD
            ? {
                birthdayMonth: source.fields?.general?.birthMonth,
                birthdayDay: source.fields?.general?.birthday
            }
            : {};
        if (!options.ltdProfile || typeof options.ltdProfile !== "object") {
            reportField(report, "required", "missing_ltd_profile", {
                targetPath: "ltd", reversible: false, provenance: "caller-required"
            });
            rejectConversion(report, "incomplete_ltd_profile", "a complete ltdProfile is required");
        }
        const profile = options.ltdProfile;
        const unsupportedProfileFields = Object.keys(profile).filter(key => ![
            "template", "inheritTextures", "version", "header", "personalityAndVoice",
            "displayName", "pronunciation", "loveGenderRaw", "canvasTexturePayload",
            "ugcTexturePayload"
        ].includes(key));
        if (unsupportedProfileFields.length) {
            rejectConversion(
                report,
                "invalid_ltd_profile",
                `unsupported ltdProfile field${unsupportedProfileFields.length === 1 ? "" : "s"}: ${unsupportedProfileFields.join(", ")}`
            );
        }
        if (profile.personalityAndVoice !== undefined) {
            if (!profile.personalityAndVoice
                || typeof profile.personalityAndVoice !== "object"
                || Array.isArray(profile.personalityAndVoice)) {
                rejectConversion(
                    report,
                    "invalid_ltd_profile",
                    "ltdProfile.personalityAndVoice must be an object with exactly 18 serialized fields"
                );
            }
            const unsupportedPersonalityFields = Object.keys(profile.personalityAndVoice)
                .filter(key => !LTD_PERSONALITY_FIELDS.includes(key));
            const missingPersonalityFields = LTD_PERSONALITY_FIELDS
                .filter(key => !Object.prototype.hasOwnProperty.call(profile.personalityAndVoice, key));
            if (unsupportedPersonalityFields.length || missingPersonalityFields.length) {
                rejectConversion(
                    report,
                    "invalid_ltd_profile",
                    `ltdProfile.personalityAndVoice must contain exactly the 18 serialized fields (${[
                        ...(unsupportedPersonalityFields.length
                            ? [`unsupported: ${unsupportedPersonalityFields.join(", ")}`]
                            : []),
                        ...(missingPersonalityFields.length
                            ? [`missing: ${missingPersonalityFields.join(", ")}`]
                            : [])
                    ].join("; ")})`
                );
            }
        }
        let ltd;
        const hasTemplate = profile.template !== undefined;
        if (hasTemplate) {
            if (isByteInput(profile.template)) {
                ltd = structuredClone(decodeLtdMii(copyBytes(profile.template, "ltdProfile.template")).ltd);
            } else {
                const templateFields = profile.template?.fields ?? profile.template;
                if (!templateFields?.ltd) {
                    throw new MiiConversionError(
                        "ltdProfile.template must be raw LTD bytes or decoded fields with an ltd namespace",
                        "invalid_ltd_profile"
                    );
                }
                ltd = structuredClone(decodeLtdMii(encodeLtdMii(templateFields)).ltd);
            }
            delete ltd.canonicalProjection;
            for (const inheritedField of [
                ["version", "ltdProfile.template.ltd.originalVersion", "ltd.originalVersion"],
                ["header", "ltdProfile.template.ltd.header", "ltd.header"]
            ]) {
                reportField(report, "overridden", `inherited_ltd_${inheritedField[0]}`, {
                    sourcePath: inheritedField[1],
                    targetPath: inheritedField[2],
                    sourceValue: inheritedField[0] === "version" ? ltd.originalVersion : ltd.header,
                    targetValue: inheritedField[0] === "version" ? ltd.originalVersion : ltd.header,
                    reversible: false,
                    provenance: "caller-profile-template"
                });
            }
            for (const key of ["personalityAndVoice", "displayName", "pronunciation", "loveGender"]) {
                reportField(report, "overridden", `inherited_ltd_${key}`, {
                    sourcePath: `ltdProfile.template.ltd.${key}`,
                    targetPath: `ltd.${key}`,
                    reversible: false,
                    provenance: "caller-profile-template"
                });
            }
            if (profile.version !== undefined && profile.version !== ltd.originalVersion) {
                rejectConversion(
                    report,
                    "unsupported_ltd_version_conversion",
                    "ltdProfile.version cannot change a template's wire version"
                );
            }
            if (profile.version !== undefined) {
                reportField(report, "overridden", "explicit_ltd_version", {
                    sourcePath: "ltdProfile.version", targetPath: "ltd.originalVersion",
                    sourceValue: profile.version, targetValue: ltd.originalVersion,
                    reversible: false, provenance: "caller-profile"
                });
            }
        } else {
            const version = requireProfileField(profile, "version", report);
            if (version !== 2 && version !== 3) {
                rejectConversion(report, "invalid_ltd_profile", "ltdProfile.version must be 2 or 3");
            }
            const header = requireProfileField(profile, "header", report);
            if (!header || typeof header !== "object") {
                rejectConversion(report, "invalid_ltd_profile", "ltdProfile.header must be an object");
            }
            validateProfileHeaderKeys(header, version, report);
            if (header.version !== undefined && header.version !== version) {
                rejectConversion(
                    report,
                    "conflicting_ltd_profile",
                    "ltdProfile.header.version must match ltdProfile.version"
                );
            }
            if (header.charInfoLength !== undefined && header.charInfoLength !== CHAR_INFO_EX_SIZE) {
                rejectConversion(
                    report,
                    "conflicting_ltd_profile",
                    `ltdProfile.header.charInfoLength must be ${CHAR_INFO_EX_SIZE}`
                );
            }
            for (const key of ["hasCanvas", "hasUgcTexture", "reserved"]) {
                if (header[key] === undefined) {
                    reportField(report, "required", `missing_ltd_header_${key}`, {
                        targetPath: `ltd.header.${key}`, reversible: false, provenance: "caller-required"
                    });
                    rejectConversion(report, "incomplete_ltd_profile", `ltdProfile.header.${key} is required`);
                }
            }
            if (version === 2 && header.legacyPadding === undefined) {
                reportField(report, "required", "missing_ltd_header_legacy_padding", {
                    targetPath: "ltd.header.legacyPadding", reversible: false, provenance: "caller-required"
                });
                rejectConversion(report, "incomplete_ltd_profile", "ltdProfile.header.legacyPadding is required for v2");
            }
            ltd = {
                format: "Tomodachi Life: Living the Dream ShareMii",
                version,
                originalVersion: version,
                header: {
                    version,
                    hasCanvas: header.hasCanvas,
                    hasUgcTexture: header.hasUgcTexture,
                    reserved: header.reserved,
                    charInfoLength: CHAR_INFO_EX_SIZE,
                    ...(version === 2 ? { legacyPadding: header.legacyPadding } : {})
                },
                personalityAndVoice: structuredClone(requireProfileField(profile, "personalityAndVoice", report)),
                displayName: parseCharInfoEx(charInfoEx).name,
                pronunciation: requireProfileField(profile, "pronunciation", report),
                loveGender: loveGenderFromRaw(requireProfileField(profile, "loveGenderRaw", report), version)
            };
            for (const explicitField of [
                ["version", "ltd.originalVersion"],
                ["header", "ltd.header"],
                ["personalityAndVoice", "ltd.personalityAndVoice"],
                ["pronunciation", "ltd.pronunciation"],
                ["loveGenderRaw", "ltd.loveGender.raw"]
            ]) {
                reportField(report, "overridden", `explicit_ltd_${explicitField[0]}`, {
                    sourcePath: `ltdProfile.${explicitField[0]}`,
                    targetPath: explicitField[1],
                    reversible: false, provenance: "caller-profile"
                });
            }
        }

        for (const key of ["personalityAndVoice", "displayName", "pronunciation"]) {
            if (profile[key] === undefined || !hasTemplate) continue;
            ltd[key] = key === "personalityAndVoice" ? structuredClone(profile[key]) : profile[key];
            reportField(report, "overridden", `explicit_ltd_${key}`, {
                sourcePath: `ltdProfile.${key}`, targetPath: `ltd.${key}`,
                reversible: false, provenance: "caller-profile"
            });
        }
        if (hasTemplate && profile.loveGenderRaw !== undefined) {
            ltd.loveGender = loveGenderFromRaw(profile.loveGenderRaw, ltd.originalVersion);
            reportField(report, "overridden", "explicit_ltd_love_gender", {
                sourcePath: "ltdProfile.loveGenderRaw", targetPath: "ltd.loveGender.raw",
                reversible: false, provenance: "caller-profile"
            });
        }
        if (hasTemplate && profile.header !== undefined) {
            if (!profile.header || typeof profile.header !== "object") {
                rejectConversion(report, "invalid_ltd_profile", "ltdProfile.header must be an object");
            }
            validateProfileHeaderKeys(profile.header, ltd.originalVersion, report);
            if (profile.header.version !== undefined && profile.header.version !== ltd.originalVersion) {
                rejectConversion(
                    report,
                    "conflicting_ltd_profile",
                    "ltdProfile.header.version cannot change a template's wire version"
                );
            }
            if (profile.header.charInfoLength !== undefined
                && profile.header.charInfoLength !== CHAR_INFO_EX_SIZE) {
                rejectConversion(
                    report,
                    "conflicting_ltd_profile",
                    `ltdProfile.header.charInfoLength must be ${CHAR_INFO_EX_SIZE}`
                );
            }
            ltd.header = { ...ltd.header, ...structuredClone(profile.header), version: ltd.originalVersion };
            reportField(report, "overridden", "explicit_ltd_header", {
                sourcePath: "ltdProfile.header", targetPath: "ltd.header",
                sourceValue: profile.header, targetValue: ltd.header,
                reversible: false, provenance: "caller-profile"
            });
        }

        if (hasTemplate && profile.inheritTextures === true) {
            if (profile.canvasTexturePayload !== undefined
                || profile.ugcTexturePayload !== undefined
                || profile.header?.hasCanvas !== undefined
                || profile.header?.hasUgcTexture !== undefined) {
                rejectConversion(
                    report,
                    "conflicting_ltd_profile",
                    "inheritTextures:true cannot be combined with explicit texture flags or payloads"
                );
            }
            reportField(report, "overridden", "inherited_donor_textures", {
                sourcePath: "ltdProfile.template.ltd.*TexturePayload",
                targetPath: "ltd.*TexturePayload",
                reversible: false,
                provenance: "caller-explicit-texture-inheritance"
            });
        } else {
            if (profile.inheritTextures !== undefined && profile.inheritTextures !== false) {
                rejectConversion(report, "invalid_ltd_profile", "ltdProfile.inheritTextures must be boolean");
            }
            const header = profile.header;
            if (!header || header.hasCanvas === undefined || header.hasUgcTexture === undefined
                || profile.canvasTexturePayload === undefined || profile.ugcTexturePayload === undefined) {
                for (const field of ["header.hasCanvas", "header.hasUgcTexture", "canvasTexturePayload", "ugcTexturePayload"]) {
                    reportField(report, "required", "explicit_texture_policy_required", {
                        targetPath: `ltdProfile.${field}`,
                        reversible: false,
                        provenance: "caller-required"
                    });
                }
                rejectConversion(
                    report,
                    "incomplete_ltd_texture_profile",
                    "explicit texture flags and both payloads are required unless inheritTextures:true"
                );
            }
            ltd.header.hasCanvas = header.hasCanvas;
            ltd.header.hasUgcTexture = header.hasUgcTexture;
            ltd.canvasTexturePayload = {
                data: profilePayload(profile.canvasTexturePayload, "ltdProfile.canvasTexturePayload")
            };
            ltd.ugcTexturePayload = {
                data: profilePayload(profile.ugcTexturePayload, "ltdProfile.ugcTexturePayload")
            };
            reportField(report, "overridden", "explicit_texture_profile", {
                sourcePath: "ltdProfile.*TexturePayload",
                targetPath: "ltd.*TexturePayload",
                reversible: false,
                provenance: "caller-profile"
            });
        }

        // Source identity wins over the donor CharInfoEx.
        ltd.charInfo = parseCharInfoEx(charInfoEx);
        if (profile.displayName !== undefined && profile.displayName !== ltd.charInfo.name) {
            reportField(report, "overridden", "ignored_profile_display_name_for_source_identity", {
                sourcePath: "ltdProfile.displayName", targetPath: "ltd.displayName",
                sourceValue: profile.displayName, targetValue: ltd.charInfo.name,
                reversible: false, provenance: "source-identity-wins"
            });
        }
        if (ltd.displayName !== ltd.charInfo.name) {
            reportField(report, "overridden", "source_name_replaced_profile_display_name", {
                sourcePath: "CharInfo.name", targetPath: "ltd.displayName",
                sourceValue: ltd.charInfo.name, targetValue: ltd.charInfo.name,
                reversible: true, provenance: "source-identity"
            });
        }
        ltd.displayName = ltd.charInfo.name;
        if (sourceOverlay.birthdayMonth !== undefined && sourceOverlay.birthdayDay !== undefined) {
            ltd.personalityAndVoice.birthdayMonth = sourceOverlay.birthdayMonth;
            ltd.personalityAndVoice.birthdayDay = sourceOverlay.birthdayDay;
            reportField(report, "transformed", "preserved_legacy_birthday", {
                sourcePath: "general.birthMonth/general.birthday",
                targetPath: "ltd.personalityAndVoice.birthdayMonth/birthdayDay",
                sourceValue: { month: sourceOverlay.birthdayMonth, day: sourceOverlay.birthdayDay },
                targetValue: { month: sourceOverlay.birthdayMonth, day: sourceOverlay.birthdayDay },
                reversible: true, provenance: "source-backed-envelope-mapping"
            });
        }
        ltd.header.charInfoLength = CHAR_INFO_EX_SIZE;
        reportField(report, "overridden", "replaced_profile_char_info_ex", {
            sourcePath: "converted.CharInfoEx",
            targetPath: "ltd.charInfo",
            reversible: true,
            provenance: "local-title-decomp-FUN_7101d69220"
        });
        const data = Buffer.from(encodeLtdMii({ ltd }));
        const mismatches = differingByteOffsets(rawLtdCharInfoEx(data), charInfoEx);
        report.verification.appearanceProjectionExact = mismatches.length === 0;
        report.verification.comparedBytes = CHAR_INFO_EX_SIZE;
        report.verification.mismatchOffsets = mismatches;
        if (mismatches.length) {
            rejectConversion(report, "conversion_verification_failed", "encoded LTD CharInfoEx differs from the recovered transform");
        }
        report.status = "converted";
        return { fields: decodeLtdMii(data), data, report };
    }
    if (edge === "char-info") {
        recordLtdEnvelopeDrops(report);
        if (mode === "exact") {
            rejectConversion(
                report,
                "lossy_conversion",
                "exact conversion is impossible because CHARINFO cannot store the LTD profile, voice, love-gender, or texture payloads"
            );
        }
        let legacyTemplate = options.legacyTemplate;
        if (legacyTemplate !== undefined) {
            const templateBytes = copyBytes(legacyTemplate, "legacyTemplate");
            if (templateBytes.length !== CHAR_INFO_SIZE) {
                rejectConversion(report, "invalid_legacy_template", "CHARINFO backport requires an 88-byte legacyTemplate");
            }
            legacyTemplate = templateBytes;
        }
        const ex = rawLtdCharInfoEx(source.data);
        try {
            normalizeCreateId(ex.subarray(0, 16));
        } catch (error) {
            rejectConversion(report, error.code, "LTD CharInfoEx does not contain a valid Nintendo CreateId");
        }
        const analysis = analyzeCharInfoExInverse(ex, {
            legacyTemplate,
            favoriteColor: options.favoriteColor,
            hairHint: options.hairHint,
            unknownByte57: options.unknownByte57
        });
        report.verification.appearanceProjectionExact = analysis.exact;
        report.verification.comparedBytes = CHAR_INFO_EX_SIZE;
        report.verification.mismatchOffsets = analysis.verification.bestMismatchOffsets ?? [];
        if (mode === "approximate" && (!analysis.exact || !analysis.fullySpecified)) {
            const data = Buffer.from(projectReviewedLtdCharInfoToCharInfo(source.fields, {
                favoriteColor: options.favoriteColor ?? legacyTemplate?.[0x27],
                unknownByte57: options.unknownByte57 ?? legacyTemplate?.[0x57]
            }));
            const mismatches = differingByteOffsets(convertCharInfoToCharInfoEx(data), ex);
            report.summary.appearanceSelectorLossless = false;
            report.verification.strategy = "completed-human-review-and-regenerate";
            report.verification.appearanceProjectionExact = mismatches.length === 0;
            report.verification.comparedBytes = CHAR_INFO_EX_SIZE;
            report.verification.mismatchOffsets = mismatches;
            if (options.favoriteColor === undefined && legacyTemplate === undefined) {
                reportField(report, "defaulted", "defaulted_missing_char_info_favorite_color", {
                    targetPath: "CharInfo.favoriteColor", targetValue: 0,
                    reversible: false, provenance: "reviewed-ltd-backport-default"
                });
            }
            if (options.unknownByte57 === undefined && legacyTemplate === undefined) {
                reportField(report, "defaulted", "defaulted_missing_char_info_reserved_byte", {
                    targetPath: "CharInfo[0x57]", targetValue: 0,
                    reversible: false, provenance: "reviewed-ltd-backport-default"
                });
            }
            reportField(report, "approximated", "reviewed_ltd_char_info_projection", {
                sourcePath: "ltd.charInfo", targetPath: "CharInfo",
                sourceValue: { catalogHash: reviewedLtdCharInfoBackport.catalogHash },
                targetValue: data,
                reversible: false,
                provenance: `completed-review-${reviewedLtdCharInfoBackport.sourceSha256}`
            });
            report.status = "converted";
            return { fields: await decodeMii(data), data, report };
        }
        if (!analysis.exact) {
            report.summary.appearanceSelectorLossless = false;
            rejectConversion(
                report,
                mode === "approximate" ? "unsupported_approximation" : "noninvertible_char_info_ex",
                "CharInfoEx is outside the exact recovered CharInfo projection; no source-backed approximation is implemented"
            );
        }
        if (!analysis.fullySpecified) {
            for (const field of analysis.missingFields) {
                reportField(report, "required", `missing_inverse_${field}`, {
                    targetPath: field, reversible: false, provenance: "caller-required"
                });
            }
            rejectConversion(
                report,
                "incomplete_legacy_metadata",
                `strict CHARINFO backport requires: ${analysis.missingFields.join(", ")}`
            );
        }
        const data = Buffer.from(analysis.charInfo);
        if (legacyTemplate !== undefined) {
            reportField(report, "overridden", "restored_char_info_metadata_from_template", {
                sourcePath: "options.legacyTemplate",
                targetPath: "CharInfo.favoriteColor/hairType/reservedByte57",
                sourceValue: legacyTemplate,
                reversible: false,
                provenance: "caller-legacy-template"
            });
        } else {
            for (const restoredField of [
                ["favoriteColor", "CharInfo.favoriteColor"],
                ["unknownByte57", "CharInfo[0x57]"],
                ["hairHint", "CharInfo.hairType"]
            ]) {
                if (options[restoredField[0]] === undefined) continue;
                reportField(report, "overridden", `restored_char_info_${restoredField[0]}`, {
                    sourcePath: `options.${restoredField[0]}`,
                    targetPath: restoredField[1],
                    sourceValue: options[restoredField[0]],
                    targetValue: options[restoredField[0]],
                    reversible: false,
                    provenance: "caller-inverse-metadata"
                });
            }
        }
        reportField(report, "transformed", "strict_char_info_ex_inverse", {
            sourcePath: "ltd.charInfo", targetPath: "CharInfo",
            reversible: true, provenance: "regenerate-and-compare"
        });
        report.status = "converted";
        return { fields: await decodeMii(data), data, report };
    }
    recordLtdEnvelopeDrops(report);
    if (mode === "exact") {
        rejectConversion(
            report,
            "lossy_conversion",
            `exact conversion is impossible because ${targetFormat.toUpperCase()} cannot store LTD-only profile and texture data`
        );
    }
    if (options.legacyTemplate === undefined) {
        reportField(report, "required", "matching_legacy_template_required", {
            targetPath: targetFormat, reversible: false, provenance: "caller-required"
        });
        rejectConversion(
            report,
            "incomplete_legacy_metadata",
            `${targetFormat.toUpperCase()} backport requires the original raw RCD/RSD as legacyTemplate`
        );
    }
    const template = copyBytes(options.legacyTemplate, "legacyTemplate");
    if (template.length !== 0x4a && template.length !== 0x4c) {
        rejectConversion(report, "invalid_legacy_template", "legacyTemplate must be a 74-byte RCD or 76-byte RSD");
    }
    const templateFormat = template.length === 0x4c ? MiiFormats.RSD : MiiFormats.RCD;
    if (!isMiiInFormat(template, templateFormat)) {
        rejectConversion(report, "invalid_legacy_template", "legacyTemplate is not structurally valid RCD/RSD data");
    }
    if (templateFormat === MiiFormats.RSD) {
        try {
            validateRsdChecksum(template);
        } catch (error) {
            rejectConversion(report, error.code, error.message);
        }
    }

    const ex = rawLtdCharInfoEx(source.data);
    let createId;
    try {
        createId = normalizeCreateId(ex.subarray(0, 16)).bytes;
    } catch (error) {
        rejectConversion(report, error.code, "LTD CharInfoEx does not contain a valid Nintendo CreateId");
    }
    const mismatches = differingByteOffsets(convertCharInfoToCharInfoEx(rcdToCharInfo(template, createId)), ex);
    report.verification.appearanceProjectionExact = mismatches.length === 0;
    report.verification.comparedBytes = CHAR_INFO_EX_SIZE;
    report.verification.mismatchOffsets = mismatches;
    if (mismatches.length) {
        report.summary.appearanceSelectorLossless = false;
        rejectConversion(
            report,
            mode === "approximate" ? "unsupported_approximation" : "legacy_template_mismatch",
            "legacyTemplate does not regenerate the LTD CharInfoEx over all 152 bytes"
        );
    }

    let data = Buffer.from(template.subarray(0, 0x4a));
    if (targetFormat === MiiFormats.RSD) {
        if (templateFormat === MiiFormats.RSD) {
            data = Buffer.from(template);
        } else {
            const rsd = Buffer.alloc(0x4c);
            data.copy(rsd, 0, 0, 0x4a);
            rsd.writeUInt16BE(crc16(rsd.subarray(0, 0x4a)), 0x4a);
            data = rsd;
        }
    }
    if (targetFormat !== templateFormat) {
        reportField(report, "transformed", targetFormat === MiiFormats.RSD
            ? "added_rsd_crc16"
            : "removed_rsd_crc16", {
            sourcePath: templateFormat, targetPath: targetFormat,
            reversible: true, provenance: "formats.js-crc16"
        });
    }
    reportField(report, "overridden", "restored_legacy_metadata_from_template", {
        sourcePath: "options.legacyTemplate",
        targetPath: `${targetFormat}.identity/birthday/creator/permissions/wrapper`,
        sourceValue: template,
        reversible: false,
        provenance: "caller-legacy-template"
    });
    reportField(report, "transformed", "verified_legacy_template_backport", {
        sourcePath: "ltd.charInfo", targetPath: targetFormat,
        reversible: false, provenance: "full-152-byte-regenerate-and-compare"
    });
    report.status = "converted";
    return { fields: await decodeMii(data), data, report };
}

function rawLtdCharInfoEx(data) {
    const section = parseLtdContainer(data).serializedSections.charInfo;
    return Buffer.from(data.subarray(section.offset, section.offset + section.byteLength));
}

function recordLtdEnvelopeDrops(report) {
    report.summary.semanticLossless = false;
    report.summary.byteReversible = false;
    for (const droppedField of [
        ["ltd_personality_voice_dropped", "ltd.personalityAndVoice"],
        ["ltd_display_name_profile_dropped", "ltd.displayName"],
        ["ltd_pronunciation_dropped", "ltd.pronunciation"],
        ["ltd_love_gender_dropped", "ltd.loveGender"],
        ["ltd_canvas_facepaint_dropped", "ltd.canvasTexturePayload"],
        ["ltd_ugc_texture_dropped", "ltd.ugcTexturePayload"],
        ["ltd_header_version_dropped", "ltd.header"]
    ]) {
        reportField(report, "dropped", droppedField[0], {
            sourcePath: droppedField[1],
            reversible: false,
            provenance: "format-boundary"
        });
    }
}


function assertAllowedConversionOptions(options, edgeOptions, report) {
    const unused = Object.keys(options).filter(key => !["sourceFormat", "mode", ...edgeOptions].includes(key));
    if (unused.length) {
        for (const key of unused) {
            reportField(report, "required", "unused_conversion_option", {
                sourcePath: `options.${key}`,
                reversible: false,
                provenance: "edge-option-contract"
            });
        }
        rejectConversion(
            report,
            "unused_conversion_option",
            `option${unused.length === 1 ? "" : "s"} ${unused.join(", ")} ${unused.length === 1 ? "is" : "are"} not used by this conversion edge`
        );
    }
}

/** Convert a supported source-backed edge without mutating the input. */
async function convertMii(input, targetFormat, options = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
        throw new MiiConversionError("conversion options must be an object", "invalid_conversion_option");
    }
    const mode = options.mode === undefined ? "exact" : options.mode;
    if (!["exact", "source-backed", "approximate"].includes(mode)) {
        throw new MiiConversionError(
            "mode must be 'exact', 'source-backed', or 'approximate'",
            "invalid_conversion_mode"
        );
    }
    targetFormat = normalizeFormat(targetFormat, "targetFormat");
    const requestedFormat = options.sourceFormat === undefined
        ? undefined
        : normalizeFormat(options.sourceFormat, "sourceFormat");
    const fieldsInput = input?.fields ?? input;
    let source;
    if (fieldsInput?.ltd) {
        if (requestedFormat !== undefined && requestedFormat !== MiiFormats.LTD) {
            throw new MiiConversionError(
                `sourceFormat ${requestedFormat} conflicts with the input's ltd namespace`,
                "conflicting_conversion_input"
            );
        }
        const data = Buffer.from(encodeLtdMii(fieldsInput));
        source = { format: MiiFormats.LTD, data, fields: decodeLtdMii(data) };
    } else if (!isByteInput(input)) {
        if (requestedFormat === undefined) {
            throw new MiiConversionError(
                "sourceFormat is required when converting decoded classic Mii fields",
                "source_format_required"
            );
        }
        if (requestedFormat === MiiFormats.LTD) {
            throw new MiiConversionError("decoded LTD input requires an ltd namespace", "invalid_ltd");
        }
        const maximumNameLength = requestedFormat === MiiFormats.CHARINFO ? 11 : 10;
        if (typeof fieldsInput?.meta?.name !== "string" || fieldsInput.meta.name.length > maximumNameLength) {
            throw new MiiConversionError(
                `${requestedFormat.toUpperCase()} source name must contain at most ${maximumNameLength} UTF-16 code units`,
                "invalid_conversion_input"
            );
        }
        assertDecodedSource(fieldsInput, requestedFormat);
        const data = Buffer.from(await encodeMii(structuredClone(fieldsInput), requestedFormat));
        if (requestedFormat === MiiFormats.CHARINFO) {
            normalizeCreateId(fieldsInput?.meta?.miiId).bytes.copy(data, 0);
            assertValidCharInfoSelectors(data);
        }
        if (!isMiiInFormat(data, requestedFormat)) {
            throw new MiiConversionError(
                `decoded ${requestedFormat.toUpperCase()} source encoded outside its valid wire ranges`,
                "invalid_conversion_input"
            );
        }
        if (requestedFormat === MiiFormats.RSD) validateRsdChecksum(data);
        const roundTrip = await decodeMii(data);
        assertDecodedSource(fieldsInput, requestedFormat, roundTrip);
        source = { format: requestedFormat, data, fields: roundTrip };
    } else {
        const data = copyBytes(input, "input");
        let format = requestedFormat;
        if (format === undefined) {
            if (data.length === 0x4a || data.length === 0x4c) {
                throw new MiiConversionError(
                    "74/76-byte legacy data is ambiguous with NCD/NSD; pass sourceFormat:'rcd' or sourceFormat:'rsd' explicitly",
                    "source_format_required"
                );
            } else if (data.length === CHAR_INFO_SIZE) format = MiiFormats.CHARINFO;
            else {
                try {
                    parseLtdContainer(data);
                    format = MiiFormats.LTD;
                } catch {
                    throw new MiiConversionError(
                        "could not infer a supported conversion source format; pass sourceFormat explicitly",
                        "source_format_required"
                    );
                }
            }
        }
        if (format === MiiFormats.LTD) {
            source = { format, data, fields: decodeLtdMii(data) };
        } else {
            if (!isMiiInFormat(data, format)) {
                throw new MiiConversionError(`input is not valid ${format.toUpperCase()} data`, "invalid_conversion_input");
            }
            if (format === MiiFormats.RSD) validateRsdChecksum(data);
            if (format === MiiFormats.CHARINFO) {
                assertValidCharInfoSelectors(data);
                normalizeCreateId(data.subarray(0, 16));
            }
            source = { format, data, fields: await decodeMii(data) };
        }
    }
    const report = {
        version: 1,
        sourceFormat: source.format,
        targetFormat,
        mode,
        status: "pending",
        summary: {
            semanticLossless: true,
            appearanceSelectorLossless: true,
            byteReversible: false
        },
        fields: {
            copied: [],
            transformed: [],
            generated: [],
            defaulted: [],
            overridden: [],
            dropped: [],
            approximated: [],
            required: []
        },
        verification: {
            strategy: "regenerate-and-compare",
            appearanceProjectionExact: false,
            comparedBytes: 0,
            mismatchOffsets: []
        }
    };
    try {
        if (targetFormat === MiiFormats.LTD
            && [MiiFormats.RCD, MiiFormats.RSD, MiiFormats.CHARINFO].includes(source.format)) {
            assertAllowedConversionOptions(
                options,
                source.format === MiiFormats.CHARINFO
                    ? ["ltdProfile"]
                    : ["ltdProfile", "createId"],
                report
            );
            return await convertConversionEdge("forward", source, targetFormat, mode, options, report);
        }
        if (source.format === MiiFormats.LTD && targetFormat === MiiFormats.CHARINFO) {
            assertAllowedConversionOptions(
                options,
                ["legacyTemplate", "favoriteColor", "hairHint", "unknownByte57"],
                report
            );
            return await convertConversionEdge("char-info", source, targetFormat, mode, options, report);
        }
        if (source.format === MiiFormats.LTD
            && [MiiFormats.RCD, MiiFormats.RSD].includes(targetFormat)) {
            assertAllowedConversionOptions(options, ["legacyTemplate"], report);
            return await convertConversionEdge("legacy", source, targetFormat, mode, options, report);
        }
        rejectConversion(
            report,
            "unsupported_conversion",
            `conversion from ${source.format.toUpperCase()} to ${targetFormat.toUpperCase()} is not source-backed`
        );
    } catch (error) {
        if (error instanceof MiiConversionError) {
            report.status = "rejected";
            if (error.report === undefined) error.report = report;
            throw error;
        }
        report.status = "rejected";
        throw new MiiConversionError(error.message, error.code ?? "conversion_failed", report);
    }
}

export {
    MiiConversionError,
    analyzeCharInfoExInverse,
    convertCharInfoToCharInfoEx,
    convertMii,
    projectReviewedLtdCharInfoToCharInfo
};
