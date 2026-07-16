import * as miiFormats from "./formats.js";
import * as miiProcess from "./miiProcess.js";

import * as qrTools from "./qrTools.js";
import { normalizeGlassesTypeFor3DSRender } from "./renderNormalization.js";

import {lookupTables} from "./data.js";

import util from "util";
import isValidPath from "is-valid-path";
import {fs, Buffer} from "./platform.js";

export * from "./formats.js";
export * from "./miiProcess.js";
export * from "./qrTools.js";
export * from "./renderNormalization.js";

const { encodeMii, decodeMii, detectMiiFormat } = miiProcess;
const { mappings, MiiFormats, ConsoleFormats } = miiFormats;
const { makeQR, scanQR } = qrTools;

const optionalModulePromises = {};
function loadOptionalModule(name, importer) {
    optionalModulePromises[name] ??= importer();
    return optionalModulePromises[name];
}

const loadAmiiboHandler = () => loadOptionalModule("amiiboHandler", () => import("./amiiboHandler.js"));
const loadMeasureConversion = () => loadOptionalModule("miiMeasureConversion", () => import("./miiMeasureConversion.js"));
const loadRendering = () => loadOptionalModule("miiRendering", () => import("./miiRendering.js"));
const loadCrypto = () => loadOptionalModule("miiCrypto", () => import("./miiCrypto.js"));
const loadInstructions = () => loadOptionalModule("miiInstructions", () => import("./miiInstructions.js"));
const loadBabies = () => loadOptionalModule("miiBabies", () => import("./miiBabies.js"));

async function callOptionalModule(loader, exportName, args) {
    const mod = await loader();
    return mod[exportName](...args);
}

function isPromiseLike(value) {
    return value && typeof value.then === "function";
}

function isSupportedBuffer(input) {
    return Buffer.isBuffer(input)
        || input instanceof Uint8Array
        || input instanceof ArrayBuffer
        || (typeof SharedArrayBuffer !== "undefined" && input instanceof SharedArrayBuffer);
}

async function insertMiiIntoAmiibo(...args) {
    return callOptionalModule(loadAmiiboHandler, "insertMiiIntoAmiibo", args);
}

async function extractMiiFromAmiibo(...args) {
    return callOptionalModule(loadAmiiboHandler, "extractMiiFromAmiibo", args);
}

async function miiHeightToMeasurements(...args) {
    return callOptionalModule(loadMeasureConversion, "miiHeightToMeasurements", args);
}

async function inchesToMiiHeight(...args) {
    return callOptionalModule(loadMeasureConversion, "inchesToMiiHeight", args);
}

async function centimetersToMiiHeight(...args) {
    return callOptionalModule(loadMeasureConversion, "centimetersToMiiHeight", args);
}

async function miiWeightToMeasurements(...args) {
    return callOptionalModule(loadMeasureConversion, "miiWeightToMeasurements", args);
}

async function imperialHeightWeightToMiiWeight(...args) {
    return callOptionalModule(loadMeasureConversion, "imperialHeightWeightToMiiWeight", args);
}

async function metricHeightWeightToMiiWeight(...args) {
    return callOptionalModule(loadMeasureConversion, "metricHeightWeightToMiiWeight", args);
}

async function renderMii(...args) {
    return callOptionalModule(loadRendering, "renderMii", args);
}

async function decryptMii(...args) {
    return callOptionalModule(loadCrypto, "decryptMii", args);
}

async function encryptMii(...args) {
    return callOptionalModule(loadCrypto, "encryptMii", args);
}

async function miiCrcCalc(...args) {
    return callOptionalModule(loadCrypto, "miiCrcCalc", args);
}

async function makeInstructions(...args) {
    return callOptionalModule(loadInstructions, "makeInstructions", args);
}

async function getAs(...args) {
    return callOptionalModule(loadInstructions, "getAs", args);
}

async function setAs(...args) {
    return callOptionalModule(loadInstructions, "setAs", args);
}

async function kidomatic(...args) {
    return callOptionalModule(loadBabies, "kidomatic", args);
}

async function makeMiiChild(...args) {
    return callOptionalModule(loadBabies, "makeMiiChild", args);
}

const FFLExpression = Object.freeze({
    NORMAL: 0,
    SMILE: 1,
    ANGER: 2,
    SORROW: 3,
    PUZZLED: 3,
    SURPRISE: 4,
    SURPRISED: 4,
    BLINK: 5,
    OPEN_MOUTH: 6,
    SMILE_OPEN_MOUTH: 7,
    HAPPY: 7,
    ANGER_OPEN_MOUTH: 8,
    SORROW_OPEN_MOUTH: 9,
    SURPRISE_OPEN_MOUTH: 10,
    BLINK_OPEN_MOUTH: 11,
    WINK_LEFT: 12,
    WINK_RIGHT: 13,
    WINK_LEFT_OPEN_MOUTH: 14,
    WINK_RIGHT_OPEN_MOUTH: 15,
    LIKE_WINK_LEFT: 16,
    LIKE: 16,
    LIKE_WINK_RIGHT: 17,
    FRUSTRATED: 18,
    BORED: 19,
    BORED_OPEN_MOUTH: 20,
    SIGH_MOUTH_STRAIGHT: 21,
    SIGH: 22,
    DISGUSTED_MOUTH_STRAIGHT: 23,
    DISGUSTED: 24,
    LOVE: 25,
    LOVE_OPEN_MOUTH: 26,
    DETERMINED_MOUTH_STRAIGHT: 27,
    DETERMINED: 28,
    CRY_MOUTH_STRAIGHT: 29,
    CRY: 30,
    BIG_SMILE_MOUTH_STRAIGHT: 31,
    BIG_SMILE: 32,
    CHEEKY: 33,
    CHEEKY_DUPLICATE: 34,
    JOJO_EYES_FUNNY_MOUTH: 35,
    JOJO_EYES_FUNNY_MOUTH_OPEN: 36,
    SMUG: 37,
    SMUG_OPEN_MOUTH: 38,
    RESOLVE: 39,
    RESOLVE_OPEN_MOUTH: 40,
    UNBELIEVABLE: 41,
    UNBELIEVABLE_DUPLICATE: 42,
    CUNNING: 43,
    CUNNING_DUPLICATE: 44,
    RASPBERRY: 45,
    RASPBERRY_DUPLICATE: 46,
    INNOCENT: 47,
    INNOCENT_DUPLICATE: 48,
    CAT: 49,
    CAT_DUPLICATE: 50,
    DOG: 51,
    DOG_DUPLICATE: 52,
    TASTY: 53,
    TASTY_DUPLICATE: 54,
    MONEY_MOUTH_STRAIGHT: 55,
    MONEY: 56,
    SPIRAL_MOUTH_STRAIGHT: 57,
    CONFUSED: 58,
    CHEERFUL_MOUTH_STRAIGHT: 59,
    CHEERFUL: 60,
    BLANK_61: 61,
    BLANK_62: 62,
    GRUMBLE_MOUTH_STRAIGHT: 63,
    GRUMBLE: 64,
    MOVED_MOUTH_STRAIGHT: 65,
    MOVED: 66,
    SINGING_MOUTH_SMALL: 67,
    SINGING: 68,
    STUNNED: 69,
    MAX: 70
});

// Types
/** @typedef {import("./mii-jsdoc.js").Mii} MiiData */
/** @typedef {import("./miiProcess.js").SupportedBuffers} SupportedBuffers */
/** @typedef {typeof MiiFormats[keyof typeof MiiFormats]} MiiFormat */
/** @typedef {typeof ConsoleFormats[keyof typeof ConsoleFormats]} ConsoleFormat */


function deleteNestedValue(obj, path) {
    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        if (current == null) return; // parent chain missing
        if (!current.hasOwnProperty(parts[i])) return;
        current = current[parts[i]];
    }

    delete current[parts[parts.length - 1]];
}
function getNestedValue(obj, path) {
    try {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }
    catch (e) {
        return null;
    }
}
function getKeyByValue(object, value) {
    for (var key in object) {
        if (object[key] === value) {
            return key;
        }
    }
    return null;
}
function setNestedValue(obj, key, value) {
    try {
        const keys = key.split('.');
        const lastKey = keys.pop();

        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
                current[key] = {};
            }
            return current[key];
        }, obj);

        target[lastKey] = value;
        return obj;
    }
    catch (e) {
        throw new Error(`${key} was not usable.`);
    }
}
function getTrimmedString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function cloneQrFields(value) {
    if (typeof structuredClone === "function") {
        try {
            return structuredClone(value);
        } catch (e) {}
    }
    return JSON.parse(JSON.stringify(value));
}
function hasTomodachiLifeQrData(mii) {
    const tl = mii?.tl;
    if (tl === null || tl === undefined) return false;
    if (typeof tl !== "object") return true;
    return Object.keys(tl).length > 0;
}
function getMiitopiaQrMii(mii) {
    const warCry = getTrimmedString(mii?.mt?.warCry);
    const catchphrase = getTrimmedString(mii?.tl?.catchphrase);
    if (!warCry && !catchphrase) return mii;

    const nextMii = cloneQrFields(mii);
    if (!getTrimmedString(nextMii?.mt?.warCry)) {
        nextMii.mt = nextMii.mt && typeof nextMii.mt === "object" ? nextMii.mt : {};
        nextMii.mt.warCry = catchphrase;
    }
    return nextMii;
}
function get3dsQrFormatForMii(mii) {
    if (hasTomodachiLifeQrData(mii)) return MiiFormats.TLE;
    if (getTrimmedString(mii?.mt?.warCry) || getTrimmedString(mii?.tl?.catchphrase)) return MiiFormats.MTE;
    return MiiFormats.CFED;
}
function normalizeQrDevice(device) {
    return String(device || "").trim().toUpperCase().replace(/[\s_-]+/g, "");
}
function isValidURL(url){
    try{
        new URL(url);
        return true;
    }
    catch(e){
        return false;
    }
}

/** 
 * The MiiJS mii object - designed to easily manipulate mii data and export into most any mii formats.
 * @example
 * const mii = await Mii.create("path/to/mii.bin"); // Create a Mii instance from a file
 * mii.fields.name = "RickAstley"; // Change the mii's name
 */
class Mii {
    /** @type {MiiData} */
    fields

    /** 
     * Constructor for internal use only
     * @private
     * @internal
     */
    constructor(decodedMii) {
        if(typeof decodedMii==="object"&&decodedMii?.meta?.hasOwnProperty("favoriteColor")){
            this.fields = decodedMii;
        }
        else{
            const decoded = decodeMii(decodedMii);
            if (isPromiseLike(decoded)) {
                throw new Error("This Mii format needs optional async decoding. Use await Mii.create(input) instead of new Mii(input).");
            }
            this.fields=decoded;
        }
    }

    /**
     * Return mii from most data types
     * @async
     * @param {*} inputData - The input data to be decoded into a Mii. This can be a path to a file, a Buffer, a URL, or a hex string.
     * @returns {Promise<Mii>} A promise that resolves to a new Mii instance with the decoded data assigned.
     */
    static async create(input,debug) {
        if(typeof input==="string"){
            if(isValidPath(input)&&fs.existsSync(input)){
                input=await fs.promises.readFile(input);
            }
            else if(isValidURL(input)){
                input=await fetch(input);
                input=await input.buffer();
            }
        }

        // Accept QR images even when uploaded files have no extension (e.g. multer temp files).
        // We detect by magic bytes/content and scan the QR before decodeMii().
        try{
            const formats = detectMiiFormat(input);
            if (formats.includes("png") || formats.includes("jpg") || formats.includes("webp")) {
                const scanned = await scanQR(input);
                if (!scanned) {
                    throw new Error("Detected an image QR format (PNG/JPG/WEBP), but couldn't decode the QR code!");
                }
                input = scanned;
            }
        }
        catch(e){
            // If format probing fails, let decodeMii handle and produce the canonical error.
        }

        const mii = await decodeMii(input,debug);
        return new Mii(mii);
    }

    /** 
     * Function for automatic conversion when used in fs.writeFileSync and similar
     * @private
     */
    [Symbol.toPrimitive](hint) {
        if (hint === "string") return this.toString();
        return this.toBuffer();
    }

    /** 
     * Function for automatic conversion when used in console.log and similar
     * @private
     */
    [util.inspect.custom]() {
        return this.toString();
    }

    /** 
     * Called when functions need to convert this class to a string.
     * Not intended for user use.
     * @private
     * @param {MiiFormat} format - The format to encode the Mii as
     */
    toString(format = MiiFormats.MNMS) {//I would normally just JSON.stringify() here, but we have to have the async loop for toBuffer anyway, might as well make toString more usable as Studio codes (the standard string for Miis at this point)
        if (!MiiFormats.hasOwnProperty(format) && getKeyByValue(MiiFormats, format) === null) {
            throw new Error(`Unexpected format: ${format}. Expected one of: ${Object.keys(MiiFormats).join(", ")}`);
        }
        let studioMii = encodeMii(this.fields, format);
        if (isPromiseLike(studioMii)) {
            throw new Error("This format needs optional async encoding. Use await mii.encode(format) instead of mii.toString(format).");
        }
        return studioMii.toString('hex');
    }

    /** 
     * Alias for .encode for when node attempts to convert this class to a Buffer
     * @private
     * @param {MiiFormat} format - The format to encode the Mii as
     */
    toBuffer(format = MiiFormats.CHARINFO) {
        return this.encode(format);
    }

    /** Convert mii to JSON for easier viewing */
    toJSON() {
        return structuredClone(this.fields);
    }

    /**
     * Helper function to set fields.
     * @deprecated prefer setting fields directly.
     * @example
     *  Mii.set({meta:{name:"RickAstley"}}) // Set a sub field with json
     *  Mii.set("name","RickAstley"); // Set a field directly
     *  Mii.set("field",null); // Delete a field
     */
    set(objOrPath, value) {
        if (objOrPath && typeof objOrPath === "object") {
            Object.assign(this.fields, objOrPath);
        }
        else if (typeof objOrPath === "string" && value !== undefined) {//value can be null, but not undefined. Undefined!==null, Undefined==null.
            if (mappings.hasOwnProperty(objOrPath)) {
                objOrPath = mappings[objOrPath];
            }
            else if (getKeyByValue(mappings, objOrPath) === null) {
                return this.fields;
            }
            if (value === null) {
                deleteNestedValue(this.fields, objOrPath);
            }
            else {
                this.fields = setNestedValue(this.fields, objOrPath, value)
            }
        }
        return this.fields;
    }

    /** 
     * @deprecated prefer getting fields directly.
     */
    get(path) {
        if (mappings.hasOwnProperty(path)) {
            path = mappings[path];
        }
        return getNestedValue(this.fields, path);//This already handles path not existing so doing it here is redundant
    }

    /** 
     * Set with validation
     * @param {ConsoleFormat} device - The console format to validate against
     */
    async setAs(device = ConsoleFormats.SWITCH, path, value) {
        if (!ConsoleFormats.hasOwnProperty(device) && !getKeyByValue(ConsoleFormats, device)) {
            throw new Error(`Invalid console type ${device}! Expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
        }
        this.fields = await setAs(this.fields, device, path, value);//Validation of path is handled here
        return this.fields;
    }

    /** 
     * Get field with validation
     * @param {ConsoleFormat} device - The console format to validate against
     */
    async getAs(device = ConsoleFormats.SWITCH, path) {
        if (!ConsoleFormats.hasOwnProperty(device) && !getKeyByValue(ConsoleFormats, device)) {
            throw new Error(`Invalid console type ${device}! Expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
        }
        return getAs(this.fields, device, path);//Validation of path is handled here
    }

    /** 
     * Encode the Mii into a Buffer in the specified format.
     * @param {MiiFormat} format - The format to encode the Mii as
     */
    encode(format = MiiFormats.CHARINFO) {
        if (!MiiFormats.hasOwnProperty(format) && getKeyByValue(MiiFormats, format) === null) {
            throw new Error(`Unexpected format: ${format}. Expected one of: ${Object.keys(MiiFormats).join(", ")}`);
        }
        return encodeMii(this.fields, format);
    }

    /** Render the mii to a QR code */
    async toQR(device="3DS",options = {}) {//The 3DS outsold the Wii U and has more Mii centric games
        const normalizedDevice = normalizeQrDevice(device);
        const isPlain3dsQr = ["3DS","CFED","CFSD","CFCD"].includes(normalizedDevice);
        const isTomodachiQr = ["TOMODACHI","TOMODACHILIFE","TL","TLE"].includes(normalizedDevice);
        const isMiitopiaQr = ["MIITOPIA","MT","MTE"].includes(normalizedDevice);
        let qrFields = this.fields;
        let qrFormat = MiiFormats.FFED;

        if (isPlain3dsQr) {
            qrFormat = MiiFormats.CFED;
        } else if (isMiitopiaQr) {
            qrFields = getMiitopiaQrMii(this.fields);
            qrFormat = getTrimmedString(qrFields?.mt?.warCry) ? MiiFormats.MTE : MiiFormats.CFED;
        } else if (isTomodachiQr) {
            qrFormat = hasTomodachiLifeQrData(this.fields) ? MiiFormats.TLE : get3dsQrFormatForMii(this.fields);
            if (qrFormat === MiiFormats.MTE) qrFields = getMiitopiaQrMii(this.fields);
        }

        let mii = await encodeMii(qrFields, qrFormat);
        const qrOptions = { ...(options || {}) };
        if (!qrOptions.image && !qrOptions.noRenderMii) {
            const overlayPng = await renderMii(qrFields, qrOptions);
            qrOptions.image = Buffer.isBuffer(overlayPng) ? overlayPng : Buffer.from(overlayPng);
        }
        if (!qrOptions.label && qrFields?.meta?.name?.length > 0) {
            qrOptions.label = qrFields.meta.name;
        }
        return makeQR(mii, qrOptions);
    }

    /** Render the Mii to an image */
    async render(fullBody = false, options = {}) {
        return await renderMii(this.fields, Object.assign(options, { fullBody }));
    }
    async renderWithStudio(fullBody = false){
        return await renderMiiWithStudio(this.fields, fullBody);
    }

    async insertIntoAmiibo(amiiboDump) {
        if (!amiiboDump || !isSupportedBuffer(amiiboDump) || (amiiboDump?.byteLength !== 532 && amiiboDump?.byteLength !== 540 && amiiboDump?.length !== 532 && amiiboDump?.length !== 540)) {
            throw new Error(`Provided dump is not an Amiibo! Expected Buffer with a length that's one of: 532, 540. Received: ${typeof amiiboDump}, ${amiiboDump?.length}`);
        }
        return insertMiiIntoAmiibo(amiiboDump, this.fields);
    }

    /** 
     * Generate instructions for how to recreate this mii on a given console
     * @param {ConsoleFormat} device - The console to generate instructions for
     * */
    async toInstructions(device = ConsoleFormats.SWITCH) { //Switch over Switch 2 here purely for one wording case of "Use the Y Button to flip the hair" :zany_face: (Thank you for this button Switch 2 I love it but Switch 2 isn't widespread yet)
        if (!ConsoleFormats.hasOwnProperty(device) && !getKeyByValue(ConsoleFormats, device)) {
            throw new Error(`Invalid console type ${device}! Expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
        }
        return makeInstructions(this.fields, device);
    }
}

const FavoriteColors = lookupTables.favoriteColors;

export {
    Mii,
    FavoriteColors,
    FFLExpression,

    insertMiiIntoAmiibo,
    extractMiiFromAmiibo,
    miiHeightToMeasurements,
    inchesToMiiHeight,
    centimetersToMiiHeight,
    miiWeightToMeasurements,
    imperialHeightWeightToMiiWeight,
    metricHeightWeightToMiiWeight,
    renderMii,
    decryptMii,
    encryptMii,
    miiCrcCalc,
    makeInstructions,
    getAs,
    setAs,
    kidomatic,
    makeMiiChild,
    normalizeGlassesTypeFor3DSRender,

    getNestedValue,
    setNestedValue,
    deleteNestedValue,
    getKeyByValue
};

export default{
    Mii,

    //The raw functions are provided as well for those who'd rather forego the class. Flexible, not rigid.
    ...miiProcess,
    ...miiFormats,

    ...qrTools,

    insertMiiIntoAmiibo,
    extractMiiFromAmiibo,
    miiHeightToMeasurements,
    inchesToMiiHeight,
    centimetersToMiiHeight,
    miiWeightToMeasurements,
    imperialHeightWeightToMiiWeight,
    metricHeightWeightToMiiWeight,
    renderMii,
    FFLExpression,
    decryptMii,
    encryptMii,
    miiCrcCalc,
    makeInstructions,
    getAs,
    setAs,
    kidomatic,
    makeMiiChild,
    normalizeGlassesTypeFor3DSRender,

    FavoriteColors,

    //These are outside MiiJS' scope but we define them here and they're nice functions to have so might as well make them available for convenience
    getNestedValue,
    setNestedValue,
    deleteNestedValue,
    getKeyByValue
};
