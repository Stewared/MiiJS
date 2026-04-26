import * as miiFormats from "./formats.js";
import * as amiiboHandler from "./amiiboHandler.js";
import * as miiMeasureConversion from "./miiMeasureConversion.js";
import * as miiRendering from "./miiRendering.js";
import * as miiCrypto from "./miiCrypto.js";
import * as miiProcess from "./miiProcess.js";
import * as miiInstructions from "./miiInstructions.js";
import * as miiBabies from "./miiBabies.js";

import * as qrTools from "./qrTools.js";

import {lookupTables} from "./data.js";

import util from "util";
import isValidPath from "is-valid-path";
import {fs} from "./platform.js";

export * from "./formats.js";
export * from "./amiiboHandler.js";
export * from "./miiMeasureConversion.js";
export * from "./miiRendering.js";
export * from "./miiCrypto.js";
export * from "./miiProcess.js";
export * from "./miiInstructions.js";
export * from "./miiBabies.js";
export * from "./qrTools.js";

const { renderMii } = miiRendering;
const { encodeMii, decodeMii, detectMiiFormat } = miiProcess;
const { mappings, MiiFormats, ConsoleFormats } = miiFormats;
const { makeQR, scanQR } = qrTools;
const { insertMiiIntoAmiibo } = amiiboHandler;
const { makeInstructions, getAs, setAs } = miiInstructions;//getAs comes from here because miiInstructions needs to use it so much, and setAs is there to be near its brother in arms

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
            this.fields=decodeMii(decodedMii);
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
    setAs(device = ConsoleFormats.SWITCH, path, value) {
        if (!ConsoleFormats.hasOwnProperty(device) && !getKeyByValue(ConsoleFormats, device)) {
            throw new Error(`Invalid console type ${device}! Expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
        }
        this.fields = setAs(this.fields, device, path, value);//Validation of path is handled here
        return this.fields;
    }

    /** 
     * Get field with validation
     * @param {ConsoleFormat} device - The console format to validate against
     */
    getAs(device = ConsoleFormats.SWITCH, path) {
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
        // TODO: document the supported options
        let mii = await encodeMii(this.fields, (["3DS","CFED","CFSD","CFCD"].includes(device))?(this.fields.hasOwnProperty("tl")?MiiFormats.TLE:MiiFormats.CFED):MiiFormats.FFED);
        return makeQR(mii, options);
    }

    /** Render the Mii to an image */
    async render(fullBody = false, options = {}) {
        // TODO: document options
        return await renderMii(this.fields, Object.assign(options, { fullBody }));
    }

    insertIntoAmiibo(amiiboDump) {
        if (!amiiboDump || !Buffer.isBuffer(amiiboDump) || (amiiboDump?.length !== 532 && amiiboDump?.length !== 540)) {
            throw new Error(`Provided dump is not an Amiibo! Expected Buffer with a length that's one of: 532, 540. Received: ${typeof amiiboDump}, ${amiiboDump?.length}`);
        }
        let mii = encodeMii(this.fields, MiiFormats.FFSD);
        return insertMiiIntoAmiibo(amiiboDump, mii);
    }

    /** 
     * Generate instructions for how to recreate this mii on a given console
     * @param {ConsoleFormat} device - The console to generate instructions for
     * */
    toInstructions(device = ConsoleFormats.SWITCH) { //Switch over Switch 2 here purely for one wording case of "Use the Y Button to flip the hair" :zany_face: (Thank you for this button Switch 2 I love it but Switch 2 isn't widespread yet)
        if (!ConsoleFormats.hasOwnProperty(device) && !getKeyByValue(ConsoleFormats, device)) {
            throw new Error(`Invalid console type ${device}! Expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
        }
        return makeInstructions(this.fields, device);
    }
}

const FavoriteColors = lookupTables.favoriteColors;

export { Mii, FavoriteColors, getNestedValue, setNestedValue, deleteNestedValue, getKeyByValue };

export default{
    Mii,

    //The raw functions are provided as well for those who'd rather forego the class. Flexible, not rigid.
    ...miiProcess,
    ...miiFormats,
    ...miiRendering,
    ...miiInstructions,
    ...miiMeasureConversion,
    ...miiBabies,
    ...amiiboHandler,
    ...miiCrypto,

    ...qrTools,

    FavoriteColors,

    //These are outside MiiJS' scope but we define them here and they're nice functions to have so might as well make them available for convenience
    getNestedValue,
    setNestedValue,
    deleteNestedValue,
    getKeyByValue
};
