import { backTables, lookupTables, islandAddresses } from "./data.js";
import { decryptMii, decryptStudio2, encryptMii, encryptStudio2 } from "./miiCrypto.js";
import lodash from "lodash";

let amiiboHandlerPromise;

async function loadAmiiboHandler() {
    amiiboHandlerPromise ??= import("./amiiboHandler.js");
    return amiiboHandlerPromise;
}

async function extractMiiFromAmiibo(data) {
    return (await loadAmiiboHandler()).extractMiiFromAmiibo(data);
}

function encodeMiitomoMii(data) {
    return Buffer.concat([
        encoders.appendCrc(data.subarray(0, 0x60)),
        data.subarray(0x60)
    ]);
}

function encodeMiitopiaMii(data) {
    return Buffer.concat([
        encoders.appendCrc(data.subarray(0, 0x60)),
        data.subarray(0x60)
    ]);
}

function binaryToHex(binaryString) {
    const decimal = BigInt('0b' + binaryString);
    return decimal.toString(16).toUpperCase().padStart(Math.ceil(binaryString.length / 4), '0');
}

function getMiiIDTimestamp(id, epoch, intervals, bits) {
    const idBigInt = BigInt('0x' + id);
    const mask = (1n << BigInt(bits)) - 1n; // Create mask for specified bits
    const seconds = (idBigInt & mask) * intervals;
    return new Date(Number(BigInt(epoch) + seconds * 1000n));
}
function getIDFromTimestamp(timestamp, epochMs, intervalSeconds, bits) {
    const t = timestamp ? new Date(timestamp) : new Date(); //Accepts Date or ISO string/number
    const timestampMs = BigInt(t.getTime());
    const epoch = BigInt(epochMs);
    const intervalMs = BigInt(intervalSeconds) * 1000n;

    const ticks = (timestampMs - epoch) / intervalMs;
    const mask = (1n << BigInt(bits)) - 1n;
    const id = ticks & mask;

    return id.toString(2).padStart(bits, "0").slice(0,bits);
}
function getKeyByValue(object, value) {
    for (var key in object) {
        if (object[key] === value) {
            return key;
        }
    }
    return null;
}

function crc16(data, current = 0x0000) {
    let crc = current;
    for (let i = 0; i < data.length; i++) {
        const byte = data[i];
        for (let bit = 7; bit >= 0; bit--) {
            crc = ((crc << 1) | ((byte >> bit) & 0x1)) & 0x1FFFF;
            if (crc & 0x10000) {
                crc ^= 0x1021;
            }
        }
    }
    for (let i = 0; i < 16; i++) {
        crc = (crc << 1) & 0x1FFFF;
        if (crc & 0x10000) {
            crc ^= 0x1021;
        }
    }
    return crc & 0xFFFF;
}

const crc32CksumTable = new Uint32Array(256);
function generateCrc32Table(table, poly = 0x04C11DB7) {
    for (let i = 0; i < 256; i++) {
        let crc = i << 24;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x80000000) ? (crc << 1) ^ poly : crc << 1;
        }
        table[i] = crc >>> 0;
    }
}
generateCrc32Table(crc32CksumTable);

function crc32(input, table = crc32CksumTable) {
    let crc = 0x00000000;
    for (let i = 0; i < input.length; i++) {
        const byte = (input[i] ^ (crc >>> 24)) & 0xFF;
        crc = (table[byte] ^ (crc << 8)) >>> 0;
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function miiCrcCalc(dat, mode = 16) {
    return mode === 32 ? crc32(dat) : crc16(dat);
}

const decoders = {
    'eyebrowYPositions': (y) => y - 3
};
const encoders = {
    'eyebrowYPositions': (y) => y + 3,
    'appendCrc': (buf, mode = 16) => {
        buf = buf.slice(0, -(mode / 8));//Since our structs for validation also indicate to the encoder to add the "checksums" as blank padding, we strip that
        const crc = miiCrcCalc(buf, mode);

        // turn number into 2 bytes
        const crcBytes = Buffer.alloc(mode / 8);
        if (mode === 32) {
            crcBytes.writeUInt32BE(crc >>> 0, 0);
        }
        else {
            crcBytes.writeUInt16BE(crc, 0);
        }

        // append
        return Buffer.concat([buf, crcBytes]);
    },
    'switchId': (id) => {
        id = Buffer.from(id.padStart(32,"0"), "hex");
        id[6] = (id[6] & 0x0f) | 0x40; // 0100xxxx
        id[8] = (id[8] & 0x3f) | 0x80; // 10xxxxxx
        return id.toString("hex");
    }
};
const processors = {
    rcdPreProcess: (obj) => {
        if(!obj.hasOwnProperty("meta")) obj.meta={type:"Default"};
        switch (obj.meta.type) {
            case 'Special':
                obj.meta.miiId = '010';
                break;
            case 'Foreign':
                obj.meta.miiId = '110';
                break;
            default:
                obj.meta.miiId = '100';
                break;
        }

        obj.meta.miiId += getIDFromTimestamp(obj.meta.creationTimestamp, Date.UTC(2006, 0, 1), 4, 29);
        obj.meta.miiId = binaryToHex(obj.meta.miiId);
        if (obj.meta?.type === "Special" && obj.perms.mingle) {
            console.warn(`Cannot have Mingle enabled for Special Miis. Disabled Mingle in the buffer output, the original object is left intact.`);
            obj.perms.mingle = false;
        }
        return obj;
    },
    cffcdPreProcess: (obj,ogDevice) => {
        if (!obj.hasOwnProperty("meta")) obj.meta = { type: "Default" };
        if (!obj.meta.hasOwnProperty("type")) obj.meta.type = "Default";
        if (obj.meta.type === "Special" && obj.perms?.sharing) {
            console.warn(`Cannot have Sharing enabled for Special Miis. Disabled sharing in the buffer output, the original object is left intact.`);
            obj.perms.sharing = false;
        }
        obj.meta.miiId = binaryToHex(`${obj.meta.type === "Special" ? 0 : 1}001${getIDFromTimestamp(obj.meta.creationTimestamp, Date.UTC(2010, 0, 1), 2, 28)}`);
        if(ogDevice!==undefined){
            obj.meta.originalDevice=ogDevice;
        }
        return obj;
    },

    rcdPostProcess: (obj, ogD) => {
        switch ((parseInt(obj.meta.miiId[0], 16) >> 1).toString(2).padStart(3, '0')) {
            case '010':
                obj.meta.type = "Special";
                break;
            case '110':
                obj.meta.type = "Foreign";
                break;
            default://100
                obj.meta.type = "Default";
                break;
        }

        obj.meta.creationTimestamp = getMiiIDTimestamp(obj.meta.miiId, Date.UTC(2006, 0, 1), 4n, 29);
        obj.meta.originalDevice = ogD;

        return obj;
    },
    cffcdPostProcess: (obj) => {
        obj.meta.type = (parseInt(obj.meta.miiId, 16) & 0x80000000) === 0 ? "Special" : "Default";

        obj.meta.creationTimestamp = getMiiIDTimestamp(obj.meta.miiId, Date.UTC(2010, 0, 1), 2n, 28);
        return obj;
    }
};

function forwardPort(data, from, to = "SWITCH") {
    from = from.toUpperCase().replaceAll(" ","");
    to = to.toUpperCase().replaceAll(" ", "");
    if(from==="SWITCH") return data;
    if (!getKeyByValue(ConsoleFormats,from)) {
        throw new Error(`${from} is not a valid type, expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
    }
    if (!getKeyByValue(ConsoleFormats,to)) {
        throw new Error(`${to} is not a valid type, expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
    }

    if (from === "WII" || from === "DS") {
        const modernFeatureOrMakeup = lookupTables.makeupsFeatures[data.face.feature];
        if (typeof modernFeatureOrMakeup === 'string') {
            data.face.feature = 0;
            data.face.makeup = Number(modernFeatureOrMakeup);
        }
        else if (typeof modernFeatureOrMakeup === 'number') {
            data.face.feature = modernFeatureOrMakeup;
            data.face.makeup = 0;
        }
        else {
            data.face.feature = 0;
            data.face.makeup = 0;
        }
    }

    if (to === "SWITCH" || from === "3DS") {
        if (!data.beard.color) data.beard.color = 8;
        if (!data.eyebrows.color) data.eyebrows.color = 8;
        if (!data.hair.color) data.hair.color = 8;
        data.eyes.color += 8;

        if (data.mouth.color < 5) {
            data.mouth.color += 19;
        }

        if (!data.glasses.color) {
            data.glasses.color = 8;
        }
        else if (data.glasses.color < 6) {
            data.glasses.color += 13;
        }
        else {
            data.glasses.color = 0;
        }
    }
    return data;
}
function backPort(data, to, from = "SWITCH") {
    from = from.toUpperCase().replaceAll(" ","");
    to = to.toUpperCase().replaceAll(" ", "");
    if(from==="WII" || from === "DS") return data;
    if (!getKeyByValue(ConsoleFormats,from)) {
        throw new Error(`${from} is not a valid type, expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
    }
    if (!getKeyByValue(ConsoleFormats,to)) {
        throw new Error(`${to} is not a valid type, expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
    }

    if (from === "SWITCH" || to === "3DS") {
        data.hair.color = backTables.switch.hairsColors[data.hair.color];
        data.eyes.color = backTables.switch.eyesColors[data.eyes.color];
        if(data.glasses.type>8) data.glasses.type = backTables.switch.glassesTypes[data.glasses.type-9];
        data.glasses.color = backTables.switch.glassesColors[data.glasses.color];
        data.mouth.color = backTables.switch.mouthsColors[data.mouth.color];
        data.face.color = backTables.switch.faceColors[data.face.color];
        data.eyebrows.color = backTables.switch.hairsColors[data.eyebrows.color];
        data.beard.color = backTables.switch.hairsColors[data.beard.color];
    }

    if (from === "3DS" || to === "WII" || to === "DS") {
        if (data.mouth.color > 2) data.mouth.color = 0;
        if (data.beard.type > 3) data.beard.type = 3;
        if (data.beard.mustache.type === 4) {
            data.beard.mustache.type = 2;
        }
        else if (data.beard.mustache.type === 5) {
            data.beard.mustache.type = 0;
            data.beard.type = 1;
        }
        //Later Miis have two separate fields, so you can have makeup and facial features (such as wrinkles) applied at the same time. The Wii/NDS only has one that covers both.
        //We prioritize facial features here because the Wii/NDS supports more of those than they do makeup types, and is more likely to apply.
        //Additionally, facial features are more likely to be inherent to the face itself.
        const legacyFeature = backTables["3ds"].features[data.face.feature];
        const legacyMakeup = backTables["3ds"].makeups[data.face.makeup];
        const numericLegacyFeature = Number(legacyFeature);
        const numericLegacyMakeup = Number(legacyMakeup);

        if (typeof legacyFeature !== 'string') {
            data.face.feature = Number.isFinite(numericLegacyFeature) ? numericLegacyFeature : 0;
        }
        else if (numericLegacyMakeup > 0) {
            data.face.feature = numericLegacyMakeup;
        }
        else {
            data.face.feature = Number.isFinite(numericLegacyFeature) ? numericLegacyFeature : 0;
        }
        data.face.makeup = 0;

        if (data.hair.type > 71) data.hair.type = backTables["3ds"].hairs[data.hair.type - 72];
        if (data.face.type > 7) data.face.type = backTables["3ds"].faces[data.face.type - 8];
        if (data.eyes.type > 47) data.eyes.type = backTables["3ds"].eyes[data.eyes.type - 48];
        if (data.nose.type > 11) data.nose.type = backTables["3ds"].noses[data.nose.type - 12];
        if (data.mouth.type > 23) data.mouth.type = backTables["3ds"].mouths[data.mouth.type - 24];
    }
    return data;
}

/**
* SwitchSDK -> NSDB?
* AMii -> Translation/canonical layer between all formats by HEYimHeroic?
* MiiNG -> PNG with Mii data embedded by HEYimHeroic, should look into.
*/

/** Enum of Mii Formats - see comments on individual items for a description of the format. */
const MiiFormats = /** @type {const} */ ({
    /**
    * Revolution Character Data
    * Wii Miis
    */
    RCD: 'rcd',
    /**
    * Revolution Store Data
    * RCD with a Checksum appended
    */
    RSD: 'rsd',
    /** 
    * Alias for RSD format
    * @deprecated This format is commonly used to represent RSD, but has been used in an official capacity as an alias of CHARINFO.
    * @returns {'rcd'}
    */
    get MII() {
        //console.warn('MII is deprecated. Use RCD for Wii formats, or CHARINFO for Switch formats instead.');
        return 'rcd';
    },
    /** 
    * Alias for RSD format
    * @deprecated This format is named after a homebrew importer/exporter for Miis on the Wii, and is the same as RSD.
    * @returns {'rcd'}
    */
    get MIIGX() {
        //console.warn('MIIGX is deprecated. Use RCD instead, which is the same in all but name.');
        return 'rcd';
    },
    /** 
    * Alias for RSD format
    * @deprecated This extension is named after an unofficial Mii creator 'My Avatar Editor', and is the same as RSD.
    * @returns {'rcd'}
    */
    get MAE() {
        //console.warn('MAE is deprecated. Use RCD instead which is the same in all but name.');
        return 'rcd';
    },

    /**
    * NDS Character Data
    * NDS Miis
    */
    NCD: 'ncd',
    /**
    * NDS Store Data
    * NCD with a Checksum appended
    */
    NSD: 'nsd',

    /** 
    * Version 3 Miis
    * @deprecated This extension is used to refer to CFCD/CFSD/FFCD/FFSD, which are functionally the same but have enough difference for encoding to need to differentiate.
    * @returns {'ffcd'}
    */
    get ver3() {
        //console.warn('This extension is used to refer to CFCD/CFSD/FFCD/FFSD, which are functionally the same but have enough difference for encoding to need to differentiate. Use FFCD/FFSD.');
        return 'ffcd';
    },
    /**
    * CTR Face Character Data
    * 3DS Miis, identical to FFCD.
    */
    CFCD: 'cfcd',
    /** 
    * Cafe Face Character Data (Unofficial Name)
    * Wii U Miis, identical to CFCD.
    */
    FFCD: 'ffcd',
    /**
    * CTR Face Store Data (Unofficial Name)
    * CFCD with a buffer and padding at the end. Identical to FFSD.
    */
    CFSD: 'cfsd',
    /**
    * Cafe Face Store Data
    * FFCD with a buffer and padding at the end. Identical to CFSD.
    */
    FFSD: 'ffsd',
    /**
    * CTR Face Encrypted Data (Unofficial Name)
    * Holds encrypted data as seen in QR codes. Identical to FFED.
    */
    CFED: 'cfed',
    /** 
    * Cafe Face Encrypted Data (Unofficial Name)
    * Holds encrypted data as seen in QR codes. Identical to CFED.
    */
    FFED: 'ffed',
    /**
    * Miitomo
    * The first 0x60 Bytes are FFSD, then Miitomo QR data follows.
    */
    Miitomo: 'miitomo',
    MIITOMO: 'miitomo',
    /**
    * Miitomo Encrypted
    */
    MIITOMOE: 'miitomoe',
    /**
    * Miitopia
    * The first 0x60 Bytes are FFSD, then Miitopia QR data follows.
    */
    Miitopia: 'mt',
    MT: 'mt',
    MIITOPIA: 'mt',
    /**
    * Miitopia Encrypted
    */
    MTE: 'mte',

    /**
    * Tomodachi Life
    * The first 0x5C Bytes are FFCD, then extra data follows.
    */
    TomodachiLife: 'tlc',
    /**
    * Tomodachi Life
    * The first 0x5C Bytes are FFCD, then extra data follows.
    */
    TLS: 'tls',
    TLC: 'tlc',
    /**
    * Tomodachi Life Encrypted
    */
    TLE: 'tle',
    TLEC: 'tlec',

    /**
    * NX Face Store Data (Unofficial Name)
    * Miis in the Switch NAND, alias of NFDB.
    */
    NFSD: 'nfsd',
    /**
    * NX Face Store Data (Unofficial Name)
    * Miis in the Switch NAND, alias of NFDB.
    */
    storedata: 'nfsd',
    /**
    * NX Face Database (Unofficial Name)
    * Miis in the Switch NAND, alias of NFSD.
    */
    NFDB: 'nfsd',
    /** 
    * Alias for NFSD format
    * There are official usecases of the sampledb extension, however this is not recommended as a filename.
    * @depricated
    * @returns {'nfsd'}
    */
    get SAMPLEDB() {
        //console.warn('SAMPLEDB is deprecated. Use NFSD instead which is the same in all but name.');
        return 'nfsd';
    },
    /**
    * NX Face Character Data (Unofficial Name)
    * NFSD without the Mii ID or checksums.
    */
    NFCD: 'nfcd',
    /**
    * NX Face Character Data (Unofficial Name)
    * NFSD without the Mii ID or checksums.
    */
    coredata: 'nfcd',
    /**
    * Character Info
    * Switch Miis
    */
    CHARINFO: 'charinfo',
    /** 
    * Ultimate Face Store Data
    * @deprecated This filetype was thought to be used exclusively in Smash Bros Ultimate, however its application is now known to be much broader than that. Use CHARINFO instead.
    * @returns {'nfsd'}
    */
    get UFSD() {
        //console.warn('UFSD is deprecated. Use NFSD instead which is the same in all but name.');
        return 'nfsd';
    },

    /**
    * My Nintendo Mii Studio (Unofficial Name)
    * Browser Localstorage format after editing Miis via Mii Studio
    */
    MNMS: 'mnms',
    /**
    * Encrypted My Nintendo Mii Studio (Unofficial Name)
    * Used for requesting image data from My Nintendo's Mii Studio
    */
    EMNMS: 'emnms',
    /**
    * Named after Mii Studio
    * Alias of MNMS
    */
    STUDIO: 'mnms',
    /**
    * Localstorage object in Mii Studio (Unofficial Name)
    * Alias of MNMS
    */
    localstorage: 'mnms',

    /**
    * Amiibo Files (Unofficial Name)
    * @deprecated Amiibos are generally .bins but here we use Amiibo for better identification purposes as all formats could be .bin. Same as NTAG.
    * @returns {'ntag'}
    */
    get AMIIBO() {
        //console.warn('AMIIBO is deprecated. Use NTAG or NTAG_ALT instead which are the same in all but name.');
        return 'ntag';
    },
    /**
    * NTAG215 Data (Unofficial Name)
    * NTAG215s are generally .bins but here we use NTAG for better identification purposes as all formats could be .bin.
    * NTAG215 chips are what are used for Amiibo chips.
    * Same as NTAG_ALT but 540 Bytes instead of 532.
    */
    NTAG: 'ntag',
    /**
    * NTAG215 Data Alternate Size (Unofficial Name)
    * Same as NTAG but 532 Bytes instead of 540.
    */
    NTAG_ALT: 'ntag_alt',
    /**
    * Decrypted Amiibo Bin (Unofficial Name)
    * Contains an unencrypted Amiibo tag
    */
    NTAG_INTERNAL: 'ntag_internal',

    /**
    * NDS Miis
    * @deprecated NDS Miis come in two formats, please be more specific about NCD or NSD.
    * @returns {'ncd'}
    */
    get NDS() {
        //console.warn('NDS Miis come in two formats, please be more specific about NCD or NSD.');
        return 'ncd';
    },
    /**
    * Wii Miis
    * @deprecated Wii Miis come in two formats, please be more specific about RCD or RSD.
    * @returns {'rcd'}
    */
    get WII() {
        //console.warn('Wii Miis come in two formats, please be more specific about RCD or RSD.');
        return 'rcd';
    },
    /**
    * 3DS Miis
    * @deprecated 3DS Miis come in multiple formats. Please be more specific about which one you need.
    * @returns {'ffcd'}
    */
    get ["3DS"]() {
        //console.warn('3DS Miis come in multiple formats. Please be more specific about which one you need.');
        return 'ffcd';
    },
    /**
    * Wii U Miis
    * @deprecated Wii U Miis come in multiple formats. Please be more specific about which one you need.
    * @returns {'ffcd'}
    */
    get WIIU() {
        //console.warn('Wii U Miis come in multiple formats. Please be more specific about which one you need.');
        return 'ffcd';
    },
    /**
    * Switch Miis
    * @deprecated Switch Miis come in multiple formats, please be more specific about which one you need.
    * @returns {'charinfo'}
    */
    get SWITCH() {
        //console.warn('Switch Miis come in multiple formats, please be more specific about which one you need.');
        return 'charinfo';
    },

    /**
     * Mii Creator Miis
     * @deprecated This is not an official file type, we are supporting it due to its widespread usage. Please use .CHARINFO instead.
     */
    MIIC:'miic'
});

/** Enum of consoles */
const ConsoleFormats =  /** @type {const} */ ({
    DS: "DS",
    WII: "WII",
    "3DS": "3DS",
    WIIU: "WIIU",
    SWITCH: "SWITCH",
    SWITCH2: "SWITCH2"
});

/**
* Layout of where to extract each field of each format.
* Unless otherwise specified, fields are numbers.
*/
let commonStructs = {
    [MiiFormats.NCD]: [
        //0x0
        {
            word: true,
            len: 16
        },
        {
            name: "favorited",
            bool: true,
            len: 1
        },
        {
            name: "favoriteColor",
            len: 4,
            max: 11
        },
        {
            name: "birthday",
            len: 5
        },
        {
            name: "birthMonth",
            len: 4,
            max: 12//0=Not Set
        },
        {
            name: "gender",//0 Male, 1 Female
            len: 1
        },
        {
            name: "unknown",
            len: 1
        },
        //0x2
        {
            name: "name",
            text: 'le',
            len: 160
        },
        //0x16
        {
            name: "height",
            len: 8,
            max: 127
        },
        //0x17
        {
            name: "weight",
            len: 8,
            max: 127
        },
        //0x18
        {
            name: "miiId",
            len: 32,
            hex: true
        },
        //x01C
        {
            name: "systemId",
            len: 32,
            hex: true,
            decoder: (id) => `${id}`.padEnd(16, "0"),
            encoder: (id) => id.slice(0, 8)
        },
        //0x20
        {
            word: true,
            len: 16
        },
        {
            name: "fromCheckMiiOut",
            bool: true,
            len: 1
        },
        {
            name: "unknown",
            len: 1
        },
        {
            name: "mingle",
            len: 1,
            decoder: (mingle) => mingle == 0 ? true : false,//Mingle is 0 for true, 1 for false
            encoder: (mingle) => mingle ? 0 : 1
        },
        {
            name: "unknown",
            len: 3,
        },
        {
            name: "faceFeature",
            len: 4,
            max: 11
        },
        {
            name: "faceColor",
            len: 3,
            max: 5
        },
        {
            name: "faceType",
            len: 3,
            max: 7
        },
        //0x22
        {
            word: true,
            len: 16
        },
        {
            name: "unknown",
            len: 5
        },
        {
            name: "hairFlipped",
            bool: true,
            len: 1
        },
        {
            name: "hairColor",
            len: 3,
            max: 7
        },
        {
            name: "hairType",
            len: 7,
            max: 71
            //qk, Add decoder to make canonical value
        },
        //0x24
        {
            word: true,
            len: 16
        },
        {
            name: "unknown",
            len: 6
        },
        {
            name: "eyebrowRotation",
            len: 4,
            max: 11
        },
        {
            name: "unknown",
            len: 1
        },
        {
            name: "eyebrowType",
            len: 5,
            max: 23
            //qk, Add decoder to make canonical value
        },
        //0x26
        {
            word: true,
            len: 16
        },
        {
            name: "eyebrowDistanceApart",
            len: 4,
            max: 12
        },
        {
            name: "eyebrowYPosition",
            len: 5,
            min: 3,
            max: 18,
            decoder: decoders.eyebrowYPositions,
            encoder: encoders.eyebrowYPositions
        },
        {
            name: "eyebrowSize",
            len: 4,
            max: 8
        },
        {
            name: "eyebrowColor",
            len: 3,
            max: 7
        },
        //0x28
        {
            word: true,
            len: 16
        },
        {
            name: "eyeYPosition",
            len: 5,
            max: 18
        },
        {
            name: "eyeRotation",
            len: 3,
            max: 7
        },
        {
            name: "unknown",
            len: 2
        },
        {
            name: "eyeType",
            len: 6,
            max: 47
            //qk, Add decoder to make canonical value
        },
        //0x2A
        {
            word: true,
            len: 16
        },
        {
            name: "unknown",
            len: 5
        },
        {
            name: "eyeDistanceApart",
            len: 4,
            max: 12
        },
        {
            name: "eyeSize",
            len: 3,
            max: 7
        },
        {
            name: "unknown",
            len: 1
        },
        {
            name: "eyeColor",
            len: 3,
            max: 5
        },
        //0x2C
        {
            word: true,
            len: 16
        },
        {
            name: "unknown",
            len: 3
        },
        {
            name: "noseYPosition",
            len: 5,
            max: 18
        },
        {
            name: "noseSize",
            len: 4,
            max: 8
        },
        {
            name: "noseType",
            len: 4,
            max: 11
        },
        //0x2E
        {
            word: true,
            len: 16
        },
        {
            name: "mouthYPosition",
            len: 5,
            max: 18
        },
        {
            name: "mouthSize",
            len: 4,
            max: 8
        },
        {
            name: "mouthColor",
            len: 2,
            max: 2
        },
        {
            name: "mouthType",
            len: 5,
            max: 23
            //qk, Turn this into a canonical value
        },
        //0x30
        {
            word: true,
            len: 16
        },
        {
            name: "glassesYPosition",
            len: 5,
            max: 20
        },
        {
            name: "glassesSize",
            len: 3,
            max: 7
        },
        {
            name: "disablesMii",
            len: 1,
            max: 0
        },
        {
            name: "glassesColor",
            len: 3,
            max: 5
        },
        {
            name: "glassesType",
            len: 4,
            max: 8
        },
        //0x32
        {
            word: true,
            len: 16
        },
        {
            name: "mustacheYPosition",
            len: 5,
            max: 16
        },
        {
            name: "mustacheSize",
            len: 4,
            max: 8
        },
        {
            name: "beardColor",
            len: 3,
            max: 7
        },
        {
            name: "beardType",
            len: 2,
            max: 3
        },
        {
            name: "mustacheType",
            len: 2,
            max: 3
        },
        //0x34
        {
            word: true,
            len: 16
        },
        {
            name: "unknown",
            len: 1
        },
        {
            name: "moleXPosition",
            len: 5,
            max: 16
        },
        {
            name: "moleYPosition",
            len: 5,
            max: 30
        },
        {
            name: "moleSize",
            len: 4,
            max: 8
        },
        {
            name: "moleActive",
            bool: true,
            len: 1
        },
        //0x36
        {
            name: "creatorName",
            text: 'le',
            len: 160
        }//0x49
    ],
    [MiiFormats.RCD]: [
        //0x0
        {
            name: "unknown",
            len: 1
        },
        {
            name: "gender",//0 Male, 1 Female
            len: 1
        },
        {
            name: "birthMonth",
            len: 4,
            max: 12//0=Not Set
        },
        //Last two bits of 0x0 - 0x1
        {
            name: "birthday",
            len: 5
        },
        {
            name: "favoriteColor",
            len: 4,
            max: 11
        },
        {
            name: "favorited",
            bool: true,
            len: 1
        },
        //0x2
        {
            name: "name",
            text: true,
            len: 160
        },
        //0x16
        {
            name: "height",
            len: 8,
            max: 127
        },
        //0x17
        {
            name: "weight",
            len: 8,
            max: 127
        },
        //0x18
        {
            name: "miiId",
            len: 32,
            hex: true
        },
        //x01C
        {
            name: "systemId",
            len: 32,
            hex: true,
            decoder: (id) => `${id}`.padEnd(16, "0"),
            encoder: (id) => (id ? id : '00000000').slice(0, 8)
        },
        //0x20
        {
            name: "faceType",
            len: 3,
            max: 7
        },
        {
            name: "faceColor",
            len: 3,
            max: 5
        },
        //Last two bits of 0x2 - 0x21
        {
            name: "faceFeature",
            len: 4,
            max: 11
        },
        {
            name: "unknown",
            len: 3,
        },
        {
            name: "mingle",
            len: 1,
            decoder: (mingle) => mingle == 0 ? true : false,//Mingle is 0 for true, 1 for false
            encoder: (mingle) => mingle ? 0 : 1
        },
        {
            name: "unknown",
            len: 1
        },
        {
            name: "fromCheckMiiOut",
            bool: true,
            len: 1
        },
        //0x22
        {
            name: "hairType",
            len: 7,
            max: 71
            //qk, Add decoder to make canonical value
        },
        //Last bit of 0x22 - 0x23
        {
            name: "hairColor",
            len: 3,
            max: 7
        },
        {
            name: "hairFlipped",
            bool: true,
            len: 1
        },
        {
            name: "unknown",
            len: 5
        },
        //0x24
        {
            name: "eyebrowType",
            len: 5,
            max: 23
            //qk, Add decoder to make canonical value
        },
        {
            name: "unknown",
            len: 1
        },
        //Last two bits of 0x24 - 0x25
        {
            name: "eyebrowRotation",
            len: 4,
            max: 11
        },
        {
            name: "unknown",
            len: 6
        },
        //0x26
        {
            name: "eyebrowColor",
            len: 3,
            max: 7
        },
        {
            name: "eyebrowSize",
            len: 4,
            max: 8
        },
        //Last bit of 0x26 - 0x27
        {
            name: "eyebrowYPosition",
            len: 5,
            min: 3,
            max: 18,
            decoder: decoders.eyebrowYPositions,
            encoder: encoders.eyebrowYPositions
        },
        {
            name: "eyebrowDistanceApart",
            len: 4,
            max: 12
        },
        //0x28
        {
            name: "eyeType",
            len: 6,
            max: 47
            //qk, Add decoder to make canonical value
        },
        {
            name: "unknown",
            len: 2
        },
        //0x29
        {
            name: "eyeRotation",
            len: 3,
            max: 7
        },
        {
            name: "eyeYPosition",
            len: 5,
            max: 18
        },
        //0x2A
        {
            name: "eyeColor",
            len: 3,
            max: 5
        },
        {
            name: "unknown",
            len: 1
        },
        {
            name: "eyeSize",
            len: 3,
            max: 7
        },
        //Last bit of 0x2A - 0x2B
        {
            name: "eyeDistanceApart",
            len: 4,
            max: 12
        },
        {
            name: "unknown",
            len: 5
        },
        //0x2C
        {
            name: "noseType",
            len: 4,
            max: 11
        },
        {
            name: "noseSize",
            len: 4,
            max: 8
        },
        //0x2D
        {
            name: "noseYPosition",
            len: 5,
            max: 18
        },
        {
            name: "unknown",
            len: 3
        },
        //0x2E
        {
            name: "mouthType",
            len: 5,
            max: 23
            //qk, Turn this into a canonical value
        },
        {
            name: "mouthColor",
            len: 2,
            max: 2
        },
        //Last bit of 0x2E - 0x2F
        {
            name: "mouthSize",
            len: 4,
            max: 8
        },
        {
            name: "mouthYPosition",
            len: 5,
            max: 18
        },
        //0x30
        {
            name: "glassesType",
            len: 4,
            max: 8
        },
        {
            name: "glassesColor",
            len: 3,
            max: 5
        },
        {
            name: "disablesMii",
            len: 1,
            max: 0
        },
        //0x31
        {
            name: "glassesSize",
            len: 3,
            max: 7
        },
        {
            name: "glassesYPosition",
            len: 5,
            max: 20
        },
        //0x32
        {
            name: "mustacheType",
            len: 2,
            max: 3
        },
        {
            name: "beardType",
            len: 2,
            max: 3
        },
        {
            name: "beardColor",
            len: 3,
            max: 7
        },
        //Last bit of 0x32 - 0x33
        {
            name: "mustacheSize",
            len: 4,
            max: 8
        },
        {
            name: "mustacheYPosition",
            len: 5,
            max: 16
        },
        //0x34
        {
            name: "moleActive",
            bool: true,
            len: 1
        },
        {
            name: "moleSize",
            len: 4,
            max: 8
        },
        //Last three bits of 0x34 - 0x35
        {
            name: "moleYPosition",
            len: 5,
            max: 30
        },
        {
            name: "moleXPosition",
            len: 5,
            max: 16
        },
        {
            name: "unknown",
            len: 1
        },
        //0x36
        {
            name: "creatorName",
            text: true,
            len: 160
        }//0x49
    ],
    [MiiFormats.FFCD]: {
        len: 0x5C,
        be: false,
        translation: '3ds',
        struct: [
            //0x0
            {
                name: "version",
                len: 8,
                encoder: () => 3
            },
            //0x1
            {
                name: "unknown",
                len: 2
            },
            {
                name: "charset",
                len: 2,
                max: 3
            },
            {
                name: "region",
                len: 2,
                max: 3
            },
            {
                name: "profaneNames",
                bool: true,
                len: 1
            },
            {
                name: "copying",
                bool: true,
                len: 1
            },
            //0x2
            {
                name: "selectionSlotIndex",
                len: 4
            },
            {
                name: "selectionPageIndex",
                len: 4
            },
            //0x3
            {
                name: "unknown",
                len: 1
            },
            {
                name: "originalDevice",
                len: 3,
                min: 1,
                max: 4//1 = Wii. 2 = DS. 3 = 3DS. 4 = Wii U/Switch( 2)
            },
            {
                name: "unknown",
                len: 4
            },
            //0x4
            {
                name: "systemId",
                hex: true,
                len: 64
            },
            //0xC
            {
                name: "miiId",
                hex: true,
                len: 32
            },
            //0x10
            {
                name: "creatorMac",
                hex: true,
                len: 48
            },
            //0x16
            {
                name: "padding",
                len: 16
            },

            //0x18
            {
                word: true, // Reverse the endianess of the next 16 bits
                len: 16
            },
            {
                name: "gender",
                len: 1//0 Male, 1 Female
            },
            {
                name: "birthMonth",
                len: 4,
                max: 12//0 if not set
            },
            {
                name: "birthday",
                len: 5
            },
            {
                name: "favoriteColor",
                len: 4,
                max: 11
            },
            {
                name: "favorited",
                bool: true,
                len: 1
            },
            {
                name: "unknown",
                len: 1
            },

            //0x1A
            {
                name: "name",
                text: 'le',
                len: 160
            },
            //0x2E
            {
                name: "height",
                len: 8,
                max: 127
            },
            //0x2F
            {
                name: "weight",
                len: 8,
                max: 127
            },
            //0x30
            {
                name: "faceColor",
                len: 3,
                max: 5
            },
            {
                name: "faceType",
                len: 4,
                max: 11
            },
            {
                name: "sharing",
                len: 1,
                decoder: (sharing) => sharing == 0 ? true : false,
                encoder: (sharing) => sharing ? 0 : 1
            },
            //0x31
            {
                name: "makeup",
                len: 4,
                max: 11
            },
            {
                name: "faceFeature",
                len: 4,
                max: 11
            },
            //0x32
            {
                name: "hairType",
                len: 8,
                max: 131
            },
            //0x33
            {
                name: "unknown",
                len: 4
            },
            {
                name: "hairFlipped",
                bool: true,
                len: 1
            },
            {
                name: "hairColor",
                len: 3,
                max: 7
            },

            //0x34
            {
                word: true,
                len: 32
            },
            {
                name: "eyeType",
                len: 6,
                max: 59
            },
            {
                name: "eyeColor",
                len: 3,
                max: 5
            },
            {
                name: "eyeSize",
                len: 4,
                max: 7//flip
            },
            {
                name: "eyeSquash",
                len: 3,
                max: 6//flip
            },
            {
                name: "eyeRotation",
                len: 5,
                max: 7
            },
            {
                name: "eyeDistanceApart",
                len: 4,
                max: 12
            },
            {
                name: "eyeYPosition",
                len: 5,
                max: 18
            },
            {
                name: "unknown",
                len: 2
            },

            //0x38
            {
                word: true,
                len: 32
            },
            {
                name: "eyebrowType",
                len: 5,
                max: 24
            },
            {
                name: "eyebrowColor",
                len: 3,
                max: 7
            },
            {
                name: "eyebrowSize",
                len: 4,
                max: 8//flip
            },
            {
                name: "eyebrowSquash",
                len: 3,
                max: 6//flip
            },
            {
                name: "unknown",
                len: 1
            },
            {
                name: "eyebrowRotation",
                len: 4,
                max: 11
            },
            {
                name: "unknown",
                len: 1
            },
            {
                name: "eyebrowDistanceApart",
                len: 4,
                max: 12
            },
            {
                name: "eyebrowYPosition",
                len: 5,
                min: 3,
                max: 18,
                decoder: decoders.eyebrowYPositions,
                encoder: encoders.eyebrowYPositions
            },
            {
                name: "unknown",
                len: 2
            },

            //0x3C
            {
                word: true,
                len: 16
            },
            {
                name: "noseType",
                len: 5,
                max: 17
            },
            {
                name: "noseSize",
                len: 4,
                max: 8//flip
            },
            {
                name: "noseYPosition",
                len: 5,
                max: 18
            },
            {
                name: "unknown",
                len: 2
            },

            //0x3E
            {
                word: true,
                len: 16
            },
            {
                name: "mouthType",
                len: 6,
                max: 35
            },
            {
                name: "mouthColor",
                len: 3,
                max: 4
            },
            {
                name: "mouthSize",
                len: 4,
                max: 8//flip
            },
            {
                name: "mouthSquash",
                len: 3,
                max: 6//flip
            },

            //0x40
            {
                word: true,
                len: 16
            },
            {
                name: "mouthYPosition",
                len: 5,
                max: 18
            },
            {
                name: "mustacheType",
                len: 3,
                max: 5
            },
            {
                name: "unknown",
                len: 8
            },

            //0x42
            {
                word: true,
                len: 16
            },
            {
                name: "beardType",
                len: 3,
                max: 5
            },
            {
                name: "beardColor",
                len: 3,
                max: 7
            },
            {
                name: "mustacheSize",
                len: 4,
                max: 8//flip
            },
            {
                name: "mustacheYPosition",
                len: 5,
                max: 16
            },
            {
                name: "unknown",
                len: 1
            },

            //0x44
            {
                word: true,
                len: 16
            },
            {
                name: "glassesType",
                len: 4,
                max: 8
            },
            {
                name: "glassesColor",
                len: 3,
                max: 5
            },
            {
                name: "glassesSize",
                len: 4,
                max: 7//flip
            },
            {
                name: "glassesYPosition",
                len: 5,
                max: 20
            },

            //0x46
            {
                word: true,
                len: 16
            },
            {
                name: "moleActive",
                bool: true,
                len: 1
            },
            {
                name: "moleSize",
                len: 4,
                max: 8//flip
            },
            {
                name: "moleXPosition",
                len: 5,
                max: 16
            },
            {
                name: "moleYPosition",
                len: 5,
                max: 30
            },
            {
                name: "unknown",
                len: 1
            },

            //0x48
            {
                name: "creatorName",
                text: 'le',
                len: 160
            }
        ],
        preProcess: (dat)=>processors.cffcdPreProcess(dat,4),
        postProcess: processors.cffcdPostProcess
    },
    [MiiFormats.FFED]: {
        len: 0x70,
        decoder: decryptMii,
        encoder: encryptMii,
        preEncode: MiiFormats.CFSD
    },
    [MiiFormats.FFED]: {
        len: 0x70,
        decoder: decryptMii,
        encoder: encryptMii,
        preEncode: MiiFormats.FFSD
    },
    [MiiFormats.NFCD]: [
        {
            name: "hairType",
            len: 8,
            max: 131
        },
        {
            name: "moleActive",
            bool: true,
            len: 1
        },
        {
            name: "height",
            len: 7,
            max: 127
        },
        {
            name: "hairFlipped",
            bool: true,
            len: 1
        },
        {
            name: "weight",
            len: 7,
            max: 127
        },
        {
            name: "isSpecial",
            bool: true,
            len: 1,
            decoder: (bool) => bool ? "Special" : "Default",
            encoder: (text) => text==="Special" ? true:false
        },
        {
            name: "hairColor",
            len: 7,
            max: 99
        },
        {
            name: "gender",
            len: 1
        },
        {
            name: "eyeColor",
            len: 7,
            max: 99
        },
        {
            name:"unknown",
            len:1
        },
        {
            name: "eyebrowColor",
            len: 7,
            max: 99
        },
        {
            name:"unknown",
            len:1
        },
        {
            name: "mouthColor",
            len: 7,
            max: 99
        },
        {
            name:"unknown",
            len:1
        },
        {
            name: "beardColor",
            len: 7,
            max: 99
        },
        {
            name:"unknown",
            len:1
        },
        {
            name: "glassesColor",
            len: 7,
            max: 99
        },
        {
            name: "region",
            len: 2,
            max: 3
        },
        {
            name: "eyeType",
            len: 6,
            max: 59
        },
        {
            name:"charset",
            len:2,
            max:3
        },
        {
            name: "mouthType",
            len: 6,
            max: 35
        },
        {
            name: "glassesSize",
            len: 3,
            max: 7
        },
        {
            name: "eyeYPosition",
            len: 5,
            max: 18
        },
        {
            name: "mustacheType",
            len: 3,
            max: 5
        },
        {
            name: "eyebrowType",
            len: 5,
            max: 23
        },
        {
            name: "beardType",
            len: 3,
            max: 5
        },
        {
            name: "noseType",
            len: 5,
            max: 17
        },
        {
            name: "mouthSquash",
            len: 3,
            max: 6
        },
        {
            name: "noseYPosition",
            len: 5,
            max: 18
        },
        {
            name: "eyebrowSquash",
            len: 3,
            max: 6
        },
        {
            name: "mouthYPosition",
            len: 5,
            max: 18
        },
        {
            name: "eyeRotation",
            len: 3,
            max: 7
        },
        {
            name: "mustacheYPosition",
            len: 5,
            max: 16
        },
        {
            name: "eyeSquash",
            len: 3,
            max: 6
        },
        {
            name: "glassesYPosition",
            len: 5,
            max: 20
        },
        {
            name: "eyeSize",
            len: 3,
            max: 7
        },
        {
            name: "moleXPosition",
            len: 5,
            max: 16
        },
        {
            name:"unknown",
            len:3
        },
        {
            name: "moleYPosition",
            len: 5,
            max: 30
        },
        {
            name:"unknown",
            len:3
        },
        {
            name: "glassesType",
            len: 5,
            max: 19
        },
        {
            name: "faceType",
            len: 4,
            max: 11
        },
        {
            name: "favoriteColor",
            len: 4,
            max: 11
        },
        {
            name: "faceFeature",
            len: 4,
            max: 11
        },
        {
            name: "faceColor",
            len: 4,
            max: 9
        },
        {
            name: "eyeDistanceApart",
            len: 4,
            max: 12
        },
        {
            name: "makeup",
            len: 4,
            max: 11
        },
        {
            name: "eyebrowRotation",
            len: 4,
            max: 11
        },
        {
            name: "eyebrowSize",
            len: 4,
            max: 8
        },
        {
            name: "eyebrowYPosition",
            len: 4,
            min: 0,
            max: 15
        },
        {
            name: "eyebrowDistanceApart",
            len: 4,
            max: 12
        },
        {
            name: "mouthSize",
            len: 4,
            max: 8
        },
        {
            name: "noseSize",
            len: 4,
            max: 8
        },
        {
            name: "moleSize",
            len: 4,
            max: 8
        },
        {
            name: "mustacheSize",
            len: 4,
            max: 8
        },
        {
            name: "name",
            text: 'le',
            len: 160
        }
    ]
};
commonStructs[MiiFormats.FFSD] = {
    len: 0x60,
    struct: [...commonStructs[MiiFormats.FFCD].struct,
        {
            name: "padding",
            len: 16,
            max: 0
        },
        {
            name: "checksum",
            len: 16
        }
    ],
    translation: '3ds',
    encoder: (dat) => encoders.appendCrc(dat),
    preProcess: (dat)=>processors.cffcdPreProcess(dat,4),
    postProcess: processors.cffcdPostProcess
};
commonStructs[MiiFormats.TLC] = [
    // Adapted from the Kaitai Struct by Arian Kordi: https://github.com/ariankordi/nwf-mii-cemu-toy/blob/ffl-renderer-proto-integrate/assets/kaitai-structs/tomodachi_life_qr_code.ksy
    {
        name: "firstName",
        len: 256,
        text: "le"
    },
    {
        name: "lastName",
        len: 256,
        text: "le"
    },
    {
        name: "birthMonth",
        len: 4,
        max: 12
    },
    {
        name: "unknown",
        len: 6
    },
    {
        name: "isAdult",
        len: 1,
        bool: true
    },
    {
        name: "birthday",
        len: 5
    },
    {
        name: "unknown",
        len: 8
    },

    {
        name: "hairDyeMode",
        len: 2,
        max: 2//0 Off, 1 Hair, 2 Hair & Eyebrows
    },
    {
        name: "hairDye",
        len: 5
    },
    {
        name: "unknown",
        len: 97
    },
    {
        name: "catchphrase",
        len: 256,
        text: 'le'
    },
    {
        name: "unknown",
        len: 16
    },
    {
        name: "outfitId",
        len: 16,
        hex: true
    },
    {
        name: "hatId",
        len: 16,
        hex: true
    },
    {
        name: "unknown",
        len: 16
    },

    {
        name: "islandId1",
        len: 128,
        hex: true
    },
    {
        name: "islandId2",
        len: 128,
        hex: true
    },
    {
        name: "authorId",
        len: 64,
        hex: true
    },
    {
        name: "islanderId",
        len: 80,
        hex: true
    },
    {
        name: "voicePitch",
        max: 100,
        len: 8
    },
    {
        name: "voiceSpeed",
        max: 100,
        len: 8
    },
    {
        name: "voiceQuality",
        max: 100,
        len: 8
    },
    {
        name: "voiceTone",
        max: 100,
        len: 8
    },
    {
        name: "voiceAccent",
        max: 100,
        len: 8
    },
    {
        name: "voiceIntonation",
        max: 3,
        len: 8
    },
    {
        name: "personalityMovement",
        min: 1,
        max: 8,
        len: 8
    },
    {
        name: "personalitySpeech",
        min: 1,
        max: 8,
        len: 8
    },
    {
        name: "personalityExpressiveness",
        min: 1,
        max: 8,
        len: 8
    },
    {
        name: "personalityAttitude",
        min: 1,
        max: 8,
        len: 8
    },
    {
        name: "personalityOverall",
        min: 1,
        max: 8,
        len: 8
    },
    {
        name: "unknownFlags",
        hex: true,
        len: 152
    },
    {
        name: "islandId3",
        len: 128,
        hex: true
    },
    {
        name: "islandName",
        len: 144,
        text: 'le'
    },
    {
        name: "unknown",
        len: 16
    },
    {
        name: "checksum",
        len: 32
    }
];

const formats = {
    //Wii
    [MiiFormats.RCD]: {
        len: 0x4a,
        translation: 'wii',
        struct: commonStructs[MiiFormats.RCD],
        preProcess: processors.rcdPreProcess,
        postProcess: (dat) => processors.rcdPostProcess(dat, 1)
    },
    [MiiFormats.RSD]: {
        len: 0x4c,
        translation: 'wii',
        struct: [...commonStructs[MiiFormats.RCD],
        //0x49
        {
            name: "checksum",
            len: 16
        }
        ],
        preProcess: processors.rcdPreProcess,
        postProcess: (dat) => processors.rcdPostProcess(dat, 1),
        encoder: (dat) => encoders.appendCrc(dat)
    },
    //DS, Practically same as Wii but Endian swaps
    [MiiFormats.NCD]: {
        translation: 'wii',
        len: 0x4a,
        be: false,
        struct: commonStructs[MiiFormats.NCD],
        preProcess: processors.rcdPreProcess,
        postProcess: (dat) => processors.rcdPostProcess(dat, 2)
    },
    [MiiFormats.NSD]: {
        translation: 'wii',
        len: 0x4c,
        be: false,
        struct: [...commonStructs[MiiFormats.NCD],
        //0x49
        {
            name: "checksum",
            len: 16
        }
        ],
        preProcess: processors.rcdPreProcess,
        postProcess: (dat) => processors.rcdPostProcess(dat, 2),
        encoder: (dat) => encoders.appendCrc(dat)
    },

    //3DS/Wii U
    [MiiFormats.FFCD]: commonStructs[MiiFormats.FFCD],
    [MiiFormats.FFSD]: commonStructs[MiiFormats.FFSD],
    [MiiFormats.FFED]: commonStructs[MiiFormats.FFED],
    [MiiFormats.CFCD]: lodash.cloneDeep(commonStructs[MiiFormats.FFCD]),
    [MiiFormats.CFSD]: lodash.cloneDeep(commonStructs[MiiFormats.FFSD]),
    [MiiFormats.CFED]: lodash.cloneDeep(commonStructs[MiiFormats.FFED]),

    //Mii Creator
    [MiiFormats.MIIC]: {
        len: 0x80,
        struct: [
            {
                name: "miicVersion",
                len: 8,
                min: 4,
                max: 4
            },
            {
                name: "miicOriginPlatform",
                len: 8,
                min: 0,
                max: 6
            },
            {
                name: "miicAuthorId",
                len: 64,
                hex: true
            },
            {
                name: "miicCreateId",
                len: 80,
                hex: true
            },
            {
                name: "creatorName",
                text: "le",
                len: 160
            },
            {
                name: "name",
                text: "le",
                len: 160
            },
            {
                name: "beardColor",
                len: 8,
                max: 99
            },
            {
                name: "beardType",
                len: 8,
                max: 5
            },
            {
                name: "birthday",
                len: 8,
                max: 31
            },
            {
                name: "birthMonth",
                len: 8,
                max: 12
            },
            {
                name: "miicBirthYear",
                len: 16,
                max: 9999
            },
            {
                name: "weight",
                len: 8,
                max: 127
            },
            {
                name: "eyeSquash",
                len: 8,
                max: 6
            },
            {
                name: "eyebrowSquash",
                len: 8,
                max: 6
            },
            {
                name: "eyebrowColor",
                len: 8,
                max: 99
            },
            {
                name: "eyebrowRotation",
                len: 8,
                max: 11
            },
            {
                name: "eyebrowSize",
                len: 8,
                max: 8
            },
            {
                name: "eyebrowType",
                len: 8,
                max: 23
            },
            {
                name: "eyebrowDistanceApart",
                len: 8,
                max: 12
            },
            {
                name: "eyebrowYPosition",
                len: 8,
                min: 3,
                max: 18,
                decoder: decoders.eyebrowYPositions,
                encoder: encoders.eyebrowYPositions
            },
            {
                name: "eyeColor",
                len: 8,
                max: 99
            },
            {
                name: "eyeRotation",
                len: 8,
                max: 7
            },
            {
                name: "eyeSize",
                len: 8,
                max: 7
            },
            {
                name: "eyeType",
                len: 8,
                max: 59
            },
            {
                name: "eyeDistanceApart",
                len: 8,
                max: 12
            },
            {
                name: "eyeYPosition",
                len: 8,
                max: 18
            },
            {
                name: "faceColor",
                len: 8,
                max: 9
            },
            {
                name: "makeup",
                len: 8,
                max: 11
            },
            {
                name: "faceType",
                len: 8,
                max: 11
            },
            {
                name: "faceFeature",
                len: 8,
                max: 11
            },
            {
                name: "miicFacePaintColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "favorited",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "favoriteColor",
                len: 8,
                max: 11
            },
            {
                name: "charset",
                len: 8,
                max: 3
            },
            {
                name: "gender",
                len: 8,
                max: 1
            },
            {
                name: "glassesColor",
                len: 8,
                max: 99
            },
            {
                name: "glassesSize",
                len: 8,
                max: 7
            },
            {
                name: "glassesType",
                len: 8,
                max: 19
            },
            {
                name: "glassesYPosition",
                len: 8,
                max: 20
            },
            {
                name: "hairColor",
                len: 8,
                max: 99
            },
            {
                name: "hairFlipped",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "hairType",
                len: 8,
                max: 131
            },
            {
                name: "miicHatFavoriteColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicHatCommonColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicHatType",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "height",
                len: 8,
                max: 127
            },
            {
                name: "miicBodyType",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "moleSize",
                len: 8,
                max: 8
            },
            {
                name: "moleActive",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "moleXPosition",
                len: 8,
                max: 16
            },
            {
                name: "moleYPosition",
                len: 8,
                max: 30
            },
            {
                name: "mouthSquash",
                len: 8,
                max: 6
            },
            {
                name: "mouthColor",
                len: 8,
                max: 99
            },
            {
                name: "mouthSize",
                len: 8,
                max: 8
            },
            {
                name: "mouthType",
                len: 8,
                max: 35
            },
            {
                name: "mouthYPosition",
                len: 8,
                max: 18
            },
            {
                name: "mustacheSize",
                len: 8,
                max: 8
            },
            {
                name: "mustacheType",
                len: 8,
                max: 5
            },
            {
                name: "mustacheYPosition",
                len: 8,
                max: 16
            },
            {
                name: "noseSize",
                len: 8,
                max: 8
            },
            {
                name: "noseType",
                len: 8,
                max: 17
            },
            {
                name: "noseYPosition",
                len: 8,
                max: 18
            },
            {
                name: "miicPantsColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicPersonality",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicRegionMove",
                len: 8,
                max: 3
            },
            {
                name: "miicShirtColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "isSpecial",
                bool: true,
                len: 8,
                max: 1,
                decoder: (bool) => bool ? "Special" : "Default",
                encoder: (text) => text === "Special" ? true : false
            },
            {
                name: "miicTransferred",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "miicEyeSclera",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "miicClothesType",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicShoesColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicHatSecondaryColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            },
            {
                name: "miicHatTertiaryColor",
                len: 8,
                decoder: (val) => val === 255 ? -1 : val,
                encoder: (val) => val === -1 ? 255 : val
            }
        ]
    },

    //Miitomo
    [MiiFormats.MIITOMO]: {
        len: 0x88,
        translation: '3ds',
        struct: [
            ...commonStructs[MiiFormats.FFSD].struct,
            {
                name: "miitomoInfo",
                len: 320,
                hex: true,
                decoder: (hex) => Buffer.from(hex, "hex").toString("ascii"),
                encoder: (value) => typeof value === "string" ? Buffer.from(value, "ascii").toString("hex") : ""
            }
        ],
        encoder: encodeMiitomoMii,
        preProcess: (dat)=>processors.cffcdPreProcess(dat,4),
        postProcess: processors.cffcdPostProcess
    },
    [MiiFormats.MIITOMOE]: {
        len: 0xAC,
        decoder: decryptMii,
        encoder: encryptMii,
        preEncode: MiiFormats.MIITOMO
    },
    [MiiFormats.MT]: {
        len: 0x120,
        translation: '3ds',
        struct: [
            ...commonStructs[MiiFormats.FFSD].struct,
            {
                name: "padding",
                len: 528
            },
            {
                name: "warCry",
                len: 416,
                text:'le'
            },
            {
                name: "padding",
                len: 592
            }
        ],
        encoder: encodeMiitopiaMii,
        preProcess: (dat)=>processors.cffcdPreProcess(dat,4),
        postProcess: processors.cffcdPostProcess
    },
    [MiiFormats.MTE]: {
        len: 0x144,
        decoder: decryptMii,
        encoder: encryptMii,
        preEncode: MiiFormats.MT
    },
    //Tomodachi Life Store Data
    [MiiFormats.TLS]: {
        len: 336,
        translation: '3ds',
        struct: [...commonStructs[MiiFormats.FFSD].struct, ...commonStructs[MiiFormats.TLC]],
        encoder: (dat) => encoders.appendCrc(dat, 32),
        preProcess: (d)=>processors.cffcdPreProcess(d,3),
        postProcess: processors.cffcdPostProcess
    },
    //Tomodachi Life Core Data
    [MiiFormats.TLC]: {
        len: 332,
        translation: '3ds',
        struct: [...commonStructs[MiiFormats.FFCD].struct, ...commonStructs[MiiFormats.TLC]],
        encoder: (dat) => encoders.appendCrc(dat, 32),
        preProcess: (d)=>{
            return processors.cffcdPreProcess(d,3);
        },
        postProcess: (mii)=>{
            mii=processors.cffcdPostProcess(mii);

            /*
                While we can derive what the resulting address would be from a given Island ID,
                there is sadly no way to go back to the Island ID from the address pieces without
                brute forcing due to the nature of the hash. A tool to do this is made available at
                https://infinimii.com/islandAddress
            */

            const digest = crypto
                .createHmac("sha1", Buffer.from("this is a tempolary key.\0", "ascii"))
                .update(Buffer.from(mii?.tl?.island?.id?.id, "hex"))
                .digest();

            const h = (BigInt(digest.readUInt32LE(4)) << 32n) | BigInt(digest.readUInt32LE(0));
            const wordCount = BigInt(islandAddresses.length);
            const ocean = islandAddresses[Number(h % wordCount)];
            const isles = islandAddresses[Number((h >> 10n) % wordCount)];
            const num1 = Number((h >> 20n) % 1000n);
            const num2 = Number((h >> 30n) % 1000n);

            mii.tl.island.id.readable=`${mii.tl.island.name} Island\n${num1}-${num2} ${isles} Isles\n${ocean} Ocean`;

            /*
                consoleIdBytes: raw bytes 0..7
                consoleIdU64LE: same value interpreted little-endian
                timeBytes: raw bytes 8..15
                timeLoU32LE: bytes 8..11, from the scene/time word at +0x30
                timeHiU32LE: bytes 12..15, from the scene/time word at +0x34
                timeU64LE: bytes 8..15 combined as one little-endian u64
                derived HMAC address pieces: num1, num2, isles, ocean, and readable
            */

            return mii;
        }
    },
    [MiiFormats.TLE]: {
        len: 372,
        decoder: decryptMii,
        encoder: encryptMii,
        preEncode: MiiFormats.TLS
    },


    //Switch
    [MiiFormats.NFCD]: {
        len: 48,
        struct: commonStructs[MiiFormats.NFCD]
    },
    [MiiFormats.NFSD]: {
        len: 68,
        struct: [...commonStructs[MiiFormats.NFCD],
        {
            name: "miiId",
            hex: true,
            len: 128,
            encoder:encoders.switchId
        },
        {
            name: "checksum",
            len: 16
        },
        {
            name: "deviceChecksum",//If we can find this checksum, we'll remember it, as it's made using data we don't really have access to (the device identifier). The main tool that interacts with NFCD/NFSD files calculates it anyway.
            hex: true,
            len: 16
        }
        ],
        encoder: (buf) => {
            const deviceCrcBytes = buf.subarray(buf.length - 2);//Preserve any device checksum bytes, as without the device ID we can't generate the device checksum ourselves. Realistically it shouldn't matter as the tool used to import these handles checksum calculation anyway.
            buf = buf.subarray(0, buf.length - 4);
            let crc = 0;
            for (let i = 0; i < buf.length; i++) {
                crc ^= buf[i] << 8;
                for (let j = 0; j < 8; j++) {
                    crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
                    crc &= 0xFFFF;
                }
            }
            // Little Endian
            crc = ((crc & 0xFF) << 8) | ((crc >>> 8) & 0xFF);
            const plainCrcBytes = Buffer.alloc(2);
            plainCrcBytes.writeUInt16LE(crc, 0);
            return Buffer.concat([buf, plainCrcBytes, deviceCrcBytes]);
        }

    },
    [MiiFormats.CHARINFO]: {
        len: 88,
        struct: [
            {
                name: "miiId",
                hex: true,
                len: 128,
                encoder:encoders.switchId
            },
            {
                name: "name",
                text: 'le',
                len: 176
            },
            {
                name: "charset",
                len: 8,
                max: 3
            },
            {
                name: "favoriteColor",
                len: 8,
                max: 11
            },
            {
                name: "gender",
                len: 8,
                max: 1
            },
            {
                name: "height",
                len: 8,
                max: 127
            },
            {
                name: "weight",
                len: 8,
                max: 127
            },
            {
                name: "isSpecial",
                bool: true,
                len: 8,
                max: 1,
                decoder: (bool) => bool ? "Special" : "Default",
                encoder: (text) => text==="Special" ? true:false
            },
            {
                name: "region",
                len: 8
            },
            {
                name: "faceType",
                len: 8,
                max: 11
            },
            {
                name: "faceColor",
                len: 8,
                max: 9
            },
            {
                name: "faceFeature",
                len: 8,
                max: 11
            },
            {
                name: "makeup",
                len: 8,
                max: 11
            },
            {
                name: "hairType",
                len: 8,
                max: 131
            },
            {
                name: "hairColor",
                len: 8,
                max: 99
            },
            {
                name: "hairFlipped",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "eyeType",
                len: 8,
                max: 59
            },
            {
                name: "eyeColor",
                len: 8,
                max: 99
            },
            {
                name: "eyeSize",
                len: 8,
                max: 7
            },
            {
                name: "eyeSquash",
                len: 8,
                max: 6
            },
            {
                name: "eyeRotation",
                len: 8,
                max: 7
            },
            {
                name: "eyeDistanceApart",
                len: 8,
                max: 12
            },
            {
                name: "eyeYPosition",
                len: 8,
                max: 18
            },
            {
                name: "eyebrowType",
                len: 8,
                max: 23
            },
            {
                name: "eyebrowColor",
                len: 8,
                max: 99
            },
            {
                name: "eyebrowSize",
                len: 8,
                max: 8
            },
            {
                name: "eyebrowSquash",
                len: 8,
                max: 6
            },
            {
                name: "eyebrowRotation",
                len: 8,
                max: 11
            },
            {
                name: "eyebrowDistanceApart",
                len: 8,
                max: 12
            },
            {
                name: "eyebrowYPosition",
                len: 8,
                min: 0,
                max: 18,
                decoder: decoders.eyebrowYPositions,
                encoder: encoders.eyebrowYPositions
            },
            {
                name: "noseType",
                len: 8,
                max: 17
            },
            {
                name: "noseSize",
                len: 8,
                max: 8
            },
            {
                name: "noseYPosition",
                len: 8,
                max: 18
            },
            {
                name: "mouthType",
                len: 8,
                max: 35
            },
            {
                name: "mouthColor",
                len: 8,
                max: 99
            },
            {
                name: "mouthSize",
                len: 8,
                max: 8
            },
            {
                name: "mouthSquash",
                len: 8,
                max: 6
            },
            {
                name: "mouthYPosition",
                len: 8,
                max: 18
            },
            {
                name: "beardColor",
                len: 8,
                max: 99
            },
            {
                name: "beardType",
                len: 8,
                max: 5
            },
            {
                name: "mustacheType",
                len: 8,
                max: 5
            },
            {
                name: "mustacheSize",
                len: 8,
                max: 8
            },
            {
                name: "mustacheYPosition",
                len: 8,
                max: 16
            },
            {
                name: "glassesType",
                len: 8,
                max: 19
            },
            {
                name: "glassesColor",
                len: 8,
                max: 99
            },
            {
                name: "glassesSize",
                len: 8,
                max: 7
            },
            {
                name: "glassesYPosition",
                len: 8,
                max: 20
            },
            {
                name: "moleActive",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "moleSize",
                len: 8,
                max: 8
            },
            {
                name: "moleXPosition",
                len: 8,
                max: 16
            },
            {
                name: "moleYPosition",
                len: 8,
                max: 30
            },
            {
                name: "unknown",
                len: 8,
                encoder:()=>0
            }
        ]
    },
    //Mii Studio
    [MiiFormats.MNMS]: {
        len: 0x2e,
        struct: [
            {
                name: "beardColor",
                len: 8,
                max: 99
            },
            {
                name: "beardType",
                len: 8,
                max: 5
            },
            {
                name: "weight",
                len: 8,
                max: 127
            },
            {
                name: "eyeSquash",
                len: 8,
                max: 6
            },
            {
                name: "eyeColor",
                len: 8,
                max: 99
            },
            {
                name: "eyeRotation",
                len: 8,
                max: 7
            },
            {
                name: "eyeSize",
                len: 8,
                max: 7
            },
            {
                name: "eyeType",
                len: 8,
                max: 59
            },
            {
                name: "eyeDistanceApart",
                len: 8,
                max: 12
            },
            {
                name: "eyeYPosition",
                len: 8,
                max: 18
            },
            {
                name: "eyebrowSquash",
                len: 8,
                max: 6
            },
            {
                name: "eyebrowColor",
                len: 8,
                max: 99
            },
            {
                name: "eyebrowRotation",
                len: 8,
                max: 11
            },
            {
                name: "eyebrowSize",
                len: 8,
                max: 8
            },
            {
                name: "eyebrowType",
                len: 8,
                max: 23
            },
            {
                name: "eyebrowDistanceApart",
                len: 8,
                max: 12
            },
            {
                name: "eyebrowYPosition",
                len: 8,
                min: 3,
                max: 18,
                decoder: decoders.eyebrowYPositions,
                encoder: encoders.eyebrowYPositions
            },
            {
                name: "faceColor",
                len: 8,
                max: 9
            },
            {
                name: "makeup",
                len: 8,
                max: 11
            },
            {
                name: "faceType",
                len: 8,
                max: 11
            },
            {
                name: "faceFeature",
                len: 8,
                max: 11
            },
            {
                name: "favoriteColor",
                len: 8,
                max: 11
            },
            {
                name: "gender",
                len: 8,
                max: 1
            },
            {
                name: "glassesColor",
                len: 8,
                max: 99
            },
            {
                name: "glassesSize",
                len: 8,
                max: 7
            },
            {
                name: "glassesType",
                len: 8,
                max: 19
            },
            {
                name: "glassesYPosition",
                len: 8,
                max: 20
            },
            {
                name: "hairColor",
                len: 8,
                max: 99
            },
            {
                name: "hairFlipped",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "hairType",
                len: 8,
                max: 131
            },
            {
                name: "height",
                len: 8,
                max: 127
            },
            {
                name: "moleSize",
                len: 8,
                max: 8
            },
            {
                name: "moleActive",
                bool: true,
                len: 8,
                max: 1
            },
            {
                name: "moleXPosition",
                len: 8,
                max: 16
            },
            {
                name: "moleYPosition",
                len: 8,
                max: 30
            },
            {
                name: "mouthSquash",
                len: 8,
                max: 6
            },
            {
                name: "mouthColor",
                len: 8,
                max: 99
            },
            {
                name: "mouthSize",
                len: 8,
                max: 8
            },
            {
                name: "mouthType",
                len: 8,
                max: 35
            },
            {
                name: "mouthYPosition",
                len: 8,
                max: 18
            },
            {
                name: "mustacheSize",
                len: 8,
                max: 8
            },
            {
                name: "mustacheType",
                len: 8,
                max: 5
            },
            {
                name: "mustacheYPosition",
                len: 8,
                max: 16
            },
            {
                name: "noseSize",
                len: 8,
                max: 8
            },
            {
                name: "noseType",
                len: 8,
                max: 17
            },
            {
                name: "noseYPosition",
                len: 8,
                max: 18
            }
        ]
    },
    [MiiFormats.EMNMS]: {
        len: 0x2f,
        decoder: decryptStudio2,
        encoder: encryptStudio2,
        preEncode: MiiFormats.MNMS
    },

    //Amiibo
    [MiiFormats.NTAG]: {
        len: 540,
        decoder: (dat) => extractMiiFromAmiibo(dat),
        preEncode: MiiFormats.CFSD,
        //QK, need to receive an Amiibo dump to insert into, encode Mii into CFSD, then insert into the Amiibo dump and return - same for other Amiibo types.
    },
    [MiiFormats.NTAG_ALT]: {
        len: 532,
        decoder: (dat) => extractMiiFromAmiibo(dat),
        preEncode: MiiFormats.CFSD,
    },
    [MiiFormats.NTAG_INTERNAL]: {
        len: 520,
        decoder: (dat) => dat.slice(76, 172),
        preEncode: MiiFormats.CFSD,
    }
};
const mappings = {
    'gender': "general.gender",
    'birthMonth': "general.birthMonth",
    'birthday': "general.birthday",
    'favoriteColor': "general.favoriteColor",
    'height': "general.height",
    'weight': "general.weight",

    'mingle': 'perms.mingle',
    'fromCheckMiiOut': 'perms.fromCheckMiiOut',
    'favorited': 'perms.favorited',
    'profaneNames': 'perms.profaneNames',
    'sharing': 'perms.sharing',
    'copying': 'perms.copying',

    'name': "meta.name",
    'isSpecial': 'meta.type',
    'creatorName': "meta.creatorName",
    'miiId': 'meta.miiId',
    'systemId': 'meta.systemId',
    'charset': 'meta.charset',
    'region': 'meta.region',
    'originalDevice': 'meta.originalDevice',

    'miicVersion': 'miic.version',
    'miicOriginPlatform': 'miic.originPlatform',
    'miicAuthorId': 'miic.authorId',
    'miicCreateId': 'miic.createId',
    'miicBirthYear': 'miic.birthYear',
    'miicFacePaintColor': 'miic.facePaintColor',
    'miicHatFavoriteColor': 'miic.hat.favoriteColor',
    'miicHatCommonColor': 'miic.hat.commonColor',
    'miicHatType': 'miic.hat.type',
    'miicBodyType': 'miic.bodyType',
    'miicPantsColor': 'miic.pantsColor',
    'miicPersonality': 'miic.personality',
    'miicRegionMove': 'miic.regionMove',
    'miicShirtColor': 'miic.shirtColor',
    'miicTransferred': 'miic.transferred',
    'miicEyeSclera': 'miic.eyeSclera',
    'miicClothesType': 'miic.clothesType',
    'miicShoesColor': 'miic.shoesColor',
    'miicHatSecondaryColor': 'miic.hat.secondaryColor',
    'miicHatTertiaryColor': 'miic.hat.tertiaryColor',

    'selectionSlotIndex': 'meta.slotIndex',//I genuinely don't know why these are relevant to the QR code data, but they're present.
    'selectionPageIndex': 'meta.pageIndex',
    'creatorMac': 'meta.creatorMac',
    'deviceChecksum': 'meta.deviceChecksum',

    'faceType': 'face.type',
    'faceColor': 'face.color',
    'faceFeature': 'face.feature',
    'makeup': 'face.makeup',

    'hairType': 'hair.type',
    'hairColor': 'hair.color',
    'hairFlipped': 'hair.flipped',

    'eyebrowType': 'eyebrows.type',
    'eyebrowRotation': 'eyebrows.rotation',
    'eyebrowColor': 'eyebrows.color',
    'eyebrowSize': 'eyebrows.size',
    'eyebrowYPosition': 'eyebrows.yPosition',
    'eyebrowDistanceApart': 'eyebrows.distanceApart',
    'eyebrowSquash': 'eyebrows.squash',

    'eyeType': 'eyes.type',
    'eyeRotation': 'eyes.rotation',
    'eyeColor': 'eyes.color',
    'eyeSize': 'eyes.size',
    'eyeDistanceApart': 'eyes.distanceApart',
    'eyeSquash': 'eyes.squash',
    'eyeYPosition': 'eyes.yPosition',

    'noseType': 'nose.type',
    'noseSize': 'nose.size',
    'noseYPosition': 'nose.yPosition',

    'mouthType': 'mouth.type',
    'mouthSize': 'mouth.size',
    'mouthYPosition': 'mouth.yPosition',
    'mouthSquash': 'mouth.squash',
    'mouthColor': 'mouth.color',

    'glassesType': 'glasses.type',
    'glassesColor': 'glasses.color',
    'glassesYPosition': 'glasses.yPosition',
    'glassesSize': 'glasses.size',

    'beardType': 'beard.type',
    'beardColor': 'beard.color',
    'mustacheType': 'beard.mustache.type',
    'mustacheSize': 'beard.mustache.size',
    'mustacheYPosition': 'beard.mustache.yPosition',

    'moleActive': 'mole.on',
    'moleSize': "mole.size",
    'moleYPosition': 'mole.yPosition',
    'moleXPosition': 'mole.xPosition',

    //Tomodachi Life
    'firstName': 'tl.firstName',
    'lastName': 'tl.lastName',
    'hairDyeMode': 'tl.hairDye.mode',
    'hairDye': 'tl.hairDye.color',
    'catchphrase': 'tl.catchphrase',
    'islandId1': 'tl.island.id.id',
    'islandId2': 'tl.island.id.id',
    'islandId3': 'tl.island.id.id',
    'ocean':'tl.island.id.ocean',
    'isles':'tl.island.id.isles',
    'tlNum1':'tl.island.id.num1',
    'tlNum2':'tl.island.id.num2',
    'authorId': 'tl.island.owner',
    'islanderId': 'tl.miiId',
    'voicePitch': 'tl.voice.pitch',
    'voiceSpeed': 'tl.voice.speed',
    'voiceQuality': 'tl.voice.quality',
    'voiceTone': 'tl.voice.tone',
    'voiceAccent': 'tl.voice.accent',
    'voiceIntonation': 'tl.voice.intonation',
    'personalityMovement': 'tl.personality.movement',
    'personalitySpeech': 'tl.personality.speech',
    'personalityExpressiveness': 'tl.personality.expressiveness',
    'personalityAttitude': 'tl.personality.attitude',
    'personalityOverall': 'tl.personality.overall',
    'islandName': 'tl.island.name',
    'isAdult': 'tl.isAdult',
    'outfitId': 'tl.clothing.outfit',
    'hatId': 'tl.clothing.hat',
    'unknownFlags': 'tl.unknownFlags',

    //Miitomo
    'allColor': 'miitomo.clothing.color',
    'topsLongColor': 'miitomo.clothing.top.long.color',
    'topsColor': 'miitomo.clothing.top.color',
    'bottomsAColor': 'miitomo.clothing.bottoms.a.color',
    'bottomsBColor': 'miitomo.clothing.bottoms.b.color',
    'shoesColor': 'miitomo.clothing.shoes.color',
    'accessoryColor': 'miitomo.clothing.accessory.color',
    'headwearColor': 'miitomo.clothing.headwear.color',
    'allIndex': 'miitomo.clothing.index',
    'topsLongIndex': 'miitomo.clothing.top.long.index',
    'topsIndex': 'miitomo.clothing.top.index',
    'bottomsAIndex': 'miitomo.clothing.bottoms.a.index',
    'bottomsBIndex': 'miitomo.clothing.bottoms.b.index',
    'shoesIndex': 'miitomo.clothing.shoes.index',
    'accessoryIndex': 'miitomo.clothing.accessory.index',
    'headwearIndex': 'miitomo.clothing.headwear.index',
    'topsState': 'miitomo.clothing.top.state',
    'voiceParam': 'miitomo.voice',
    'characterParam': 'miitomo.character',
    'specialMiiRegion': 'miitomo.specialRegion',
    'birthYear': 'miitomo.birthYear',
    'miitomoInfo': 'miitomo',//Remove once Miitomo is understood better

    //Miitopia
    'warCry':'mt.warCry'
};

formats[MiiFormats.CFCD].preProcess=(dat)=>processors.cffcdPreProcess(dat,3);
formats[MiiFormats.CFSD].preProcess=(dat)=>processors.cffcdPreProcess(dat,3);
formats[MiiFormats.CFED].preEncode=MiiFormats.CFSD;
formats[MiiFormats.CFCD].struct[9]={
    name: "originalDevice",
    len: 3,
    min: 3,
    max: 3
};
formats[MiiFormats.CFSD].struct[9]={
    name: "originalDevice",
    len: 3,
    min: 3,
    max: 3
};

//These defaults are based off of real observed defaults, [Male Default, Female Default]. Any omitted field defaults to 0.
//Most all of these should never be hit, just things like names for MNMS format, and the extra things like squash for Wii/NDS, but the other non-zero defaults are mapped for generating instructions.
const defaultMappings = {
    'height': 64,
    'weight': 64,

    //Copying technically defaults off on console, I default it on because what reason do you have to turn it off, really? "Oh no my Mii is copyrighted!"? Especially when working with a library like this where you can just turn it back on, and when the Mii is on console having it off is just a nuisance that's easy but annoying to workaround.
    //So technically an incorrect default value, but "No offense, but I really don't care". Super super easy to toggle off again. I'm putting this comment here exclusively for documentation purposes.
    'mingle': true,
    'sharing': true,
    'copying': true,

    'type': "Default",
    'name': "no name",
    'originalDevice': 4,//3DS/Wii U set this, Wii/NDS have code written to set this to 1/2 in their post process, so having the Switch (technically and Wii U) as a default is fine and should be what's desired in almost all cases from a default.
    'miicVersion': 4,
    'miicOriginPlatform': 5,
    'miicFacePaintColor': -1,
    'miicHatFavoriteColor': -1,
    'miicHatCommonColor': -1,
    'miicHatType': -1,
    'miicBodyType': -1,
    'miicPantsColor': -1,
    'miicPersonality': -1,
    'miicShirtColor': -1,
    'miicTransferred': false,
    'miicEyeSclera': false,
    'miicClothesType': -1,
    'miicShoesColor': -1,
    'miicHatSecondaryColor': -1,
    'miicHatTertiaryColor': -1,

    'hairType': [0x21, 0x0C],
    'hairColor': 1,

    'eyebrowType': [6, 0],
    'eyebrowRotation': 6,
    'eyebrowColor': 1,
    'eyebrowSize': 4,
    'eyebrowYPosition': 7,
    'eyebrowDistanceApart': 2,
    'eyebrowSquash': 3,

    'eyeType': [2, 4],
    'eyeColor': 8,
    'eyeRotation': [4, 3],
    'eyeSize': 4,
    'eyeDistanceApart': 2,
    'eyeSquash': 3,
    'eyeYPosition': 12,

    'noseType': 1,
    'noseSize': 4,
    'noseYPosition': 9,

    'mouthType': 0x17,
    'mouthColor': 19,
    'mouthSize': 4,
    'mouthYPosition': 13,
    'mouthSquash': 3,

    'glassesYPosition': 10,
    'glassesSize': 4,
    'glassesColor': 8,

    'mustacheSize': 4,
    'mustacheYPosition': 10,
    'beardColor': 8,

    'moleSize': 4,
    'moleYPosition': 20,
    'moleXPosition': 2,

    'firstName': 'no name',
    'lastName': 'no name',
    'islandName': 'no name',
    'outfitId': '0000',
    'hatId': 'FFFF',
    'voicePitch': 50,
    'voiceSpeed': 50,
    'voiceQuality': 50,
    'voiceTone': 50,
    'voiceAccent': 50,
    'personalityMovement': 4,
    'personalitySpeech': 4,
    'personalityExpressiveness': 4,
    'personalityAttitude': 4,
    'personalityOverall': 4,
    'isAdult': true,
    'unknownFlags': '045D3FB91CD3040D3DC07600FEFF0F20FFFF0F'//Donor flags from one of my Miis, I don't know what's in these flags but without them the Mii won't load so here's mine
};

export {
    MiiFormats,
    ConsoleFormats,
    formats,
    mappings,
    defaultMappings,
    forwardPort,
    backPort
};
