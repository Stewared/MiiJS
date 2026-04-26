import isPng from 'is-png';
import isJpg from 'is-jpg';

import { formats, mappings, defaultMappings, forwardPort, backPort } from "./formats.js";
import { lookupTables } from "./data.js";

import { Buffer } from "./platform.js";

import { scanQR } from "./qrTools.js";

function isWebp(buf) {
    return (
        Buffer.isBuffer(buf)
        && buf.length >= 12
        && buf.toString("ascii", 0, 4) === "RIFF"
        && buf.toString("ascii", 8, 12) === "WEBP"
    );
}

/** @typedef {Buffer|Uint8Array|ArrayBuffer|SharedArrayBuffer} SupportedBuffers */

/** Returns polyfilled buffer if type is buffer type, else false */
function isBuffer(inp) {
    const isValidBuffer =
        Buffer.isBuffer(inp)
        || inp instanceof Uint8Array
        || inp instanceof ArrayBuffer
        || inp instanceof SharedArrayBuffer;
    // || (Array.isArray(inp) && inp.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

    if (!isValidBuffer) return false;
    return Buffer.from(inp);
}
function ensureBuffer(buf, debug) {
    // If already bytes, just validate buffer
    let out = buf;

    if (typeof out === "string") {
        const s = out.trim();

        // ---- data URI ----
        if (/^data:/i.test(s)) {
            const comma = s.indexOf(",");
            if (comma === -1) return false;

            const meta = s.slice(5, comma);// after "data:" up to comma
            let data = s.slice(comma + 1);

            const isB64 = /;\s*base64\s*$/i.test(meta);
            if (debug) console.log(`Processing as data URI (${isB64 ? "base64" : "percent"})`);

            if (isB64) {
                // base64 payload (strip whitespace, allow base64url, allow missing padding)
                data = data.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
                const pad = data.length % 4;
                if (pad) data += "=".repeat(4 - pad);

                out = bytesFromBase64(data);
            } else {
                // percent-encoded (data:,Hello%20world)
                try {
                    const decoded = decodeURIComponent(data);
                    out = bytesFromText(decoded);
                } catch {
                    return false;
                }
            }
        }
        else {
            const compact = s.replace(/\s+/g, "");
            if (/^[0-9a-f]+$/i.test(compact) && (compact.length % 2 === 0)) {
                if (debug) console.log("Processing as hex");
                out = bytesFromHex(compact);
            }
            else if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(compact) && compact.length >= 4) {
                if (debug) console.log("Processing as base64");
                let b64 = compact.replace(/-/g, "+").replace(/_/g, "/");
                const pad = b64.length % 4;
                if (pad) b64 += "=".repeat(4 - pad);
                out = bytesFromBase64(b64);
            }
        }
    }
    out = isBuffer(out);
    return out ? out : false;
}
function bytesFromHex(hex) {
    if (typeof Buffer !== "undefined" && Buffer.from) return Buffer.from(hex, "hex");
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0, j = 0; i < hex.length; i += 2, j++) out[j] = parseInt(hex.slice(i, i + 2), 16);
    return out;
}

function bytesFromBase64(b64) {
    if (typeof Buffer !== "undefined" && Buffer.from) return Buffer.from(b64, "base64");
    if (typeof atob !== "undefined") {
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }
    return null;
}

function bytesFromText(str) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(str);
    if (typeof Buffer !== "undefined" && Buffer.from) return Buffer.from(str, "utf8");
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
}


/** @typedef {import("./mii-jsdoc.js").Mii} MiiData */

const canonical3DSGlassesTypes = new Set(lookupTables.glassesTypes);

function formatUses3DSTranslation(formatName, visited = new Set()) {
    if (!formatName || visited.has(formatName)) return false;
    visited.add(formatName);

    const format = formats[formatName];
    if (!format) return false;
    if (format.translation === "3ds") return true;
    if (format.preEncode) return formatUses3DSTranslation(format.preEncode, visited);
    return false;
}


function bufferToBitString(buf) {
    let out = '';
    for (let i = 0; i < buf.length; i++) {
        out += buf[i].toString(2).padStart(8, '0');
    }
    return out;
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
function getNestedValue(obj, path) {
    if (path === 'SKIP') return null;
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

function binaryToText(binaryString) {
    const chars = [];

    for (let i = 0; i + 16 <= binaryString.length; i += 16) {
        const chunk = binaryString.slice(i, i + 16);

        const highByte = parseInt(chunk.slice(0, 8), 2);
        const lowByte = parseInt(chunk.slice(8, 16), 2);
        const charCode = (highByte << 8) | lowByte;

        // stop at first null character (0x0000)
        if (charCode === 0) break;

        chars.push(String.fromCharCode(charCode));
    }

    return chars.join('');
}

function textToBinaryBE(text, bitLength) {
    const numChars = bitLength / 16;
    let binary = '';
    for (let i = 0; i < numChars; i++) {
        const charCode = i < text.length ? text.charCodeAt(i) : 0;
        binary += charCode.toString(2).padStart(16, '0');
    }
    return binary;
}

function textToBinaryLE(text, bitLength) {
    const numChars = bitLength / 16;
    let binary = '';
    for (let i = 0; i < numChars; i++) {
        const charCode = i < text.length ? text.charCodeAt(i) : 0;
        // Low byte (bits 0-7), then high byte (bits 8-15)
        const lowByte = (charCode & 0xFF).toString(2).padStart(8, '0');
        const highByte = ((charCode >> 8) & 0xFF).toString(2).padStart(8, '0');
        binary += lowByte + highByte;
    }
    return binary;
}

function binaryToTextLE(binaryString) {
    const chars = [];

    for (let i = 0; i + 16 <= binaryString.length; i += 16) {
        const chunk = binaryString.slice(i, i + 16);

        // First 8 bits = low byte, next 8 bits = high byte (little-endian)
        const lowByte = parseInt(chunk.slice(0, 8), 2);
        const highByte = parseInt(chunk.slice(8, 16), 2);
        const charCode = (highByte << 8) | lowByte;

        // stop at first null character (0x0000)
        if (charCode === 0) break;

        chars.push(String.fromCharCode(charCode));
    }

    return chars.join('');
}

/**
* Check whether given buffer matches the specified mii format
* @param {SupportedBuffers} buf - The buffer to validate.
* @param {string} requireFormat - The format requested.
* @param {boolean} debug - Debug logging
* @returns {boolean} Returns true if the buffer is in provided format, false if not.
*/
function isMiiInFormat(buf, requireFormat, debug) {
    // Validate input
    buf = isBuffer(buf);
    if (!buf) {
        console.error(`Is not a buffer`);
        return false;
    }

    // Validate format
    requireFormat = requireFormat?.toLowerCase().replaceAll(".", '');
    if (buf.length !== formats[requireFormat].len) {
        if (debug) console.log(`The file length does not match ${requireFormat}, expected`, formats[requireFormat].len, "got", buf.length);
        return false;
    }

    let bits = bufferToBitString(buf);
    let offset = 0;
    let wordBits = null;
    let wordPos = 0;
    let wordEnd = 0;
    if (formats[requireFormat].hasOwnProperty('struct')) {
        let wordStartOffset = 0;

        for (const field of formats[requireFormat].struct) {
            if (field.word) {
                wordStartOffset = offset;
                const raw = bits.slice(offset, offset + field.len);
                const bytes = raw.match(/.{1,8}/g) || [];
                wordBits = bytes.map(b => b.split('').reverse().join('')).join('');
                wordPos = 0;
                wordEnd = field.len;
                continue;
            }

            const inWord = wordBits && wordPos + field.len <= wordEnd;

            // choose slice
            const slice = inWord
                ? wordBits.slice(wordPos, wordPos + field.len)
                : bits.slice(offset, offset + field.len);

            // validate
            if (field.max !== undefined || field.min !== undefined) {
                const numBits = inWord ? slice.split('').reverse().join('') : slice;
                const subset = parseInt(numBits, 2);
                const min = field.min ?? 0;
                const max = field.max ?? subset; // if no max, don't fail
                if (subset < min || subset > max) {
                    if (debug) console.log(`${requireFormat} fails due to ${field.name} being ${subset}, which is outside the bounds of ${min}-${max}. Offset ${offset}.`);
                    return false;
                }
            }

            // advance (MATCH decodeMii)
            if (inWord) {
                wordPos += field.len;
                if (wordPos >= wordEnd) {
                    wordBits = null;
                    offset = wordStartOffset + wordEnd;
                }
            } else {
                offset += field.len;
            }
        }

    }

    // Passed all checks
    return true;
}

/**
* Detects the Mii format(s) present in the given buffer.
* @param {Buffer} buf - The potential mii buffer
* @param {boolean} debug - Optional flag to enable debug logging.
* @returns {string[]} An array of matching format names, or null if the input is not a Buffer.
*/
function detectMiiFormat(buf, debug) {
    buf = isBuffer(buf);
    if (!buf) return [];
    let matches = [];
    Object.keys(formats).forEach(form => {
        if (isMiiInFormat(buf, form, debug)) matches.push(form);
    });

    if (matches.length == 0) {
        //We only do this if no other format matches since Miis have no headers/magic bytes and I imagine some format could have the potential to collide with a PNG/JPG's
        if (isPng(buf)) matches.push("png");
        if (isJpg(buf)) matches.push("jpg");
        if (isWebp(buf)) matches.push("webp");
    }

    return matches;
}

/**
 * Decodes Mii data from various input formats (Buffer, hex string, file path, or URL) into a structured object.
 * If the input is already a decoded object (checked by presence of 'general.favoriteColor'), it returns as-is.
 * Supports decoding from different Mii formats, including QR codes in images, and applies post-processing or translations if defined.
 * 
 * @param {SupportedBuffers|string} toDecode - The data to decode. Accepts a Buffer, a hex string, a file path string, or a URL string.
 * @param {boolean} [debug] - Optional flag to enable debug logging during the decoding process.
 * @returns {MiiData} The decoded Mii object with structured data.
 * @throws {Error} If the input type is invalid, QR code decoding fails, or no decodable format is found.
 */
function decodeMii(toDecode, debug) {
    // If data is already decoded, return - TODO: verifying the format here would be better than a single field check
    if (toDecode?.general?.hasOwnProperty("favoriteColor")) return toDecode;

    //Ensure Buffer, convert from hex string, file path string, URL path string
    toDecode = ensureBuffer(toDecode);
    if (!toDecode) throw new Error(`toDecode is an invalid type (Accepts: Buffer, Hex String, File Path String, URL String).`);

    //Choose the file type to decode it from
    var miiType = detectMiiFormat(toDecode);
    if (miiType.includes("png") || miiType.includes("jpg") || miiType.includes("webp")) {
        toDecode = scanQR(toDecode);
        if (toDecode === null) throw new Error(`Detected an image QR format (PNG/JPG/WEBP), but couldn't decode the QR code!`);
        miiType = detectMiiFormat(toDecode);
    }
    miiType = miiType.filter(a => formats[a].hasOwnProperty("struct"));
    if (miiType.length == 0) {
        //Before we throw, check if it's an encrypted format we can decrypt
        let workableFormats = detectMiiFormat(toDecode, debug);
        if (workableFormats.filter(a => formats[a].hasOwnProperty("decoder")).length > 0) {
            toDecode = formats[workableFormats[0]].decoder(toDecode);
            if (debug) console.log(`Attempted to decode as ${workableFormats[0]}`);
            //If it decoded correctly to JSON already, our job here is done.
            if (typeof toDecode == 'object' && !isBuffer(toDecode)) {
                if (debug) console.log(`Returning a pre-decoded object`);
                return toDecode;
            }
            else {
                miiType = detectMiiFormat(toDecode).filter(a => formats[a].hasOwnProperty("struct"));
                if (debug) console.log(`Now decoding as ${miiType}`);
            }
        }
        if (miiType.length == 0) {
            if (debug) console.error(toDecode);
            throw new Error(`Could not find any decodeable formats${(typeof debug !== "boolean" && debug !== undefined) ? ` for ${debug}` : ``}: ${detectMiiFormat(toDecode, debug)}`);
        }
    }
    miiType = miiType[0];

    //Start building based on the struct definition
    var obj = {};
    var offset = 0;
    let val;
    let bits = bufferToBitString(toDecode);
    let wordBits = null;
    let wordPos = 0;
    let wordEnd = 0;
    let wordStartOffset = 0;
    for (const field of formats[miiType].struct) {
        // Start a word window (does NOT consume offset)
        if (field.word) {
            wordStartOffset = offset;
            const raw = bits.slice(offset, offset + field.len);
            const bytes = raw.match(/.{1,8}/g) || [];
            wordBits = bytes.map(b => b.split('').reverse().join('')).join('');
            wordPos = 0;
            wordEnd = field.len;
            continue;
        }

        const wasInWord = wordBits && wordPos + field.len <= wordEnd;

        if (mappings[field.name] === 'SKIP') {
            if (wasInWord) {
                wordPos += field.len;
                if (wordPos >= wordEnd) {
                    wordBits = null;
                    offset = wordStartOffset + wordEnd;
                }
            }
            else {
                offset += field.len;
            }
            continue;
        }

        let subset;

        if (wasInWord) {
            subset = wordBits.slice(wordPos, wordPos + field.len);
        }
        else {
            subset = bits.slice(offset, offset + field.len);
        }

        if (field.text) {
            // Support both boolean (defaults to "be") and explicit endianness
            const endianness = typeof field.text === 'string' ? field.text.toLowerCase() : 'be';
            val = (endianness === 'le') ? binaryToTextLE(subset) : binaryToText(subset);
        }
        else if (field.hex) {
            val = subset.match(/.{1,4}/g)
                .map(chunk => parseInt(chunk, 2).toString(16).toUpperCase())
                .join('');
        }
        else {
            // Numeric fields from word are LSB->MSB, reverse them
            const numBits = wasInWord ? subset.split('').reverse().join('') : subset;
            val = parseInt(numBits, 2);
            if (field.bool) val = !!val;
        }

        if (field.hasOwnProperty("decoder")) {
            val = field.decoder(val);
        }

        if (mappings[field.name] === undefined && debug) {
            console.log(`Skipping ${field.name} for being undefined.`);
        }
        else if (mappings[field.name] !== undefined) {
            obj = setNestedValue(obj, mappings[field.name], val);
        }

        // Advance positions
        if (wasInWord) {
            wordPos += field.len;
            if (wordPos >= wordEnd) {
                wordBits = null;
                offset = wordStartOffset + wordEnd;
            }
        } else {
            offset += field.len;
        }
    }

    if (formats[miiType].hasOwnProperty("postProcess")) {
        obj = formats[miiType].postProcess(obj);
    }
    if (formats[miiType].hasOwnProperty("translation")) {
        obj = forwardPort(obj, formats[miiType].translation);
    }

    return obj;
}
function encodeMii(miiObject, targetFormat, debug) {
    if (!formats[targetFormat]) {
        throw new Error(`Unknown format: ${targetFormat}`);
    }

    if (!formats[targetFormat].hasOwnProperty("struct")) {
        if (!formats[targetFormat].hasOwnProperty("encoder")) {
            throw new Error(`Format ${targetFormat} does not have a struct definition for encoding`);
        }
        else {
            if (formats[targetFormat].hasOwnProperty("preEncode")) miiObject = encodeMii(miiObject, formats[targetFormat].preEncode);
            return formats[targetFormat].encoder(miiObject);
        }
    }

    // Apply pre-processing
    let obj = structuredClone(miiObject);
    if (formats[targetFormat].hasOwnProperty("translation")) {
        obj = backPort(obj, formats[targetFormat].translation);
    }
    if (formats[targetFormat].hasOwnProperty("preProcess")) {
        obj = formats[targetFormat].preProcess(obj);
    }

    // Helper function to get nested value from object


    // Build bit string
    let bits = '';
    let wordBits = '';
    let wordLen = 0;
    let inWord = false;

    for (const field of formats[targetFormat].struct) {
        // Start a word window
        if (field.word) {
            inWord = true;
            wordBits = '';
            wordLen = field.len;
            continue;
        }
        let val = getNestedValue(obj, mappings[field.name]);

        // Handle SKIP fields
        if (mappings[field.name] === 'SKIP') {
            if (field.hasOwnProperty("encoder")) {
                val = field.encoder(val);
            }
            else {
                const skipBits = '0'.repeat(field.len);
                if (inWord) {
                    wordBits += skipBits;
                } else {
                    bits += skipBits;
                }

                if (inWord && wordBits.length >= wordLen) {
                    // Reverse bytes and append to main bits
                    const byteReversed = wordBits.match(/.{1,8}/g)
                        .map(b => b.split('').reverse().join(''))
                        .join('');
                    bits += byteReversed;
                    inWord = false;
                    wordBits = '';
                }
                continue;
            }
        }

        // Handle undefined values
        if (val === undefined || val === null) {
            val = defaultMappings.hasOwnProperty(field.name) ? defaultMappings[field.name] : (f => {
                let v = Math.min(f.max, Math.max(0, f.min));
                if (f.text) {
                    v = "";
                }
                else if (f.hex) {
                    v = "0".repeat(f.len / 4);
                }
                else if (f.bool) {
                    v = false;
                }
                return v;
            })(field);
            //Some fields have different defaults for different genders, if a gender is set, use that one's default. Otherwise use the male default (games like Tomodachi Life set this precedent).
            if (typeof val == 'object') val = val[+getNestedValue(obj, 'general.gender') ? +getNestedValue(obj, 'general.gender') : 0];
        }

        // Apply specific encoder if present
        if (field.hasOwnProperty("encoder")) {
            val = field.encoder(val);
        }

        let fieldBits;

        if (field.text) {
            // Text encoding
            if (val.length === 0) val = "";
            const endianness = typeof field.text === 'string' ? field.text.toLowerCase() : 'be';
            fieldBits = (endianness === 'le')
                ? textToBinaryLE(val, field.len)
                : textToBinaryBE(val, field.len);
        }
        else if (field.hex) {
            // Expect val to be a Uint8Array / Buffer OR hex string
            let bytes;
            const hexStr = val.replace(/[^0-9A-Fa-f]/g, "");
            bytes = Buffer.from(hexStr, "hex");

            const totalBits = field.len;
            const totalBytes = Math.ceil(totalBits / 8);

            // Pad or truncate to required byte length
            const fixed = Buffer.alloc(totalBytes);
            bytes.copy(fixed, 0, 0, Math.min(bytes.length, totalBytes));

            // Convert to bit string, then clamp to exact bit length
            fieldBits = "";
            for (let i = 0; i < fixed.length; i++) {
                fieldBits += fixed[i].toString(2).padStart(8, "0");
            }

            fieldBits = fieldBits.slice(0, totalBits);
        }

        else {
            // Numeric/boolean encoding
            let numVal = field.bool ? (val ? 1 : 0) : Number(val);

            if (isNaN(numVal)) {
                if (debug) console.warn(`Non-numeric value for ${field.name}: ${val}, using 0`);
                numVal = 0;
            }

            // Convert to binary
            fieldBits = numVal.toString(2).padStart(field.len, '0');

            // For word fields, reverse the bits (LSB->MSB)
            if (inWord) {
                fieldBits = fieldBits.split('').reverse().join('');
            }

            // Ensure correct length
            if (fieldBits.length > field.len) {
                fieldBits = fieldBits.slice(-field.len); // Truncate from left
                if (debug) console.warn(`Value truncated for ${field.name}: ${val}`);
            }
        }

        // Append to appropriate bit string
        if (inWord) {
            wordBits += fieldBits;

            // Check if word is complete
            if (wordBits.length >= wordLen) {
                // Reverse each byte and append to main bits
                const bytes = wordBits.slice(0, wordLen).match(/.{1,8}/g) || [];
                const byteReversed = bytes.map(b => b.split('').reverse().join('')).join('');
                bits += byteReversed;

                inWord = false;
                wordBits = '';
            }
        } else {
            bits += fieldBits;
        }
    }

    // Convert bit string to buffer
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8);
        bytes.push(parseInt(byte.padEnd(8, '0'), 2));
    }

    const buffer = Buffer.from(bytes);

    // Apply encryption if format has encoder
    if (formats[targetFormat].hasOwnProperty("encoder")) {
        return formats[targetFormat].encoder(buffer);
    }

    return buffer;
}

export {
    isMiiInFormat,
    detectMiiFormat,
    decodeMii,
    encodeMii
};
