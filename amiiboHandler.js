// Takes Amiibo dumps that are either 532 bytes or 540 bytes, and manipulates a 96 byte FFSD Mii in/out of the dump from offset 0x4C.
// Ported from https://github.com/socram8888/amiitool
import { Buffer, createCipheriv, createDecipheriv, createHmac } from "./platform.js";
import {decodeMii,encodeMii} from "./miiProcess.js";
import {MiiFormats} from "./formats.js";

// Returns polyfilled buffer if type is buffer type, else false
function isBuffer(inp) { // TODO: move to utils or smth
    const isValidBuffer = 
    Buffer.isBuffer(inp)
    || inp instanceof Uint8Array
    || inp instanceof ArrayBuffer
    || inp instanceof SharedArrayBuffer;
    // || (Array.isArray(inp) && inp.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
    
    if (!isValidBuffer) return false;
    else return Buffer.from(inp);
}
const NFC3D_AMIIBO_SIZE = 520;

function calcSeed(dump) {
    const seed = Buffer.alloc(64);
    dump.slice(0x029, 0x02B).copy(seed, 0x00);
    seed.fill(0x00, 0x02, 0x10);
    dump.slice(0x1D4, 0x1DC).copy(seed, 0x10);
    dump.slice(0x1D4, 0x1DC).copy(seed, 0x18);
    dump.slice(0x1E8, 0x208).copy(seed, 0x20);
    return seed;
}
function prepareSeed(typeString, magicBytes, magicBytesSize, xorPad, baseSeed) {
    const output = Buffer.alloc(480);
    let offset = 0;
    const typeStringEnd = typeString.indexOf(0);
    const typeLen = typeStringEnd >= 0 ? typeStringEnd + 1 : 14;
    typeString.slice(0, typeLen).copy(output, offset);
    offset += typeLen;
    const leadingSeedBytes = 16 - magicBytesSize;
    baseSeed.slice(0, leadingSeedBytes).copy(output, offset);
    offset += leadingSeedBytes;
    magicBytes.slice(0, magicBytesSize).copy(output, offset);
    offset += magicBytesSize;
    baseSeed.slice(0x10, 0x20).copy(output, offset);
    offset += 16;
    for (let i = 0; i < 32; i++) {
        output[offset + i] = baseSeed[0x20 + i] ^ xorPad[i];
    }
    offset += 32;
    return output.slice(0, offset);
}
function drbgGenerateBytes(hmacKey, seed, outputSize) {
    const result = Buffer.alloc(outputSize);
    let offset = 0;
    let iteration = 0;
    while (offset < outputSize) {
        const iterBuffer = Buffer.alloc(2 + seed.length);
        iterBuffer[0] = (iteration >> 8) & 0xFF;
        iterBuffer[1] = iteration & 0xFF;
        seed.copy(iterBuffer, 2);
        const hmac = createHmac('sha256', hmacKey);
        hmac.update(iterBuffer);
        const output = hmac.digest();
        const toCopy = Math.min(32, outputSize - offset);
        output.copy(result, offset, 0, toCopy);
        offset += toCopy;
        iteration++;
    }
    return result;
}
function deriveKeys(typeString, magicBytes, magicBytesSize, xorPad, hmacKey, baseSeed) {
    const preparedSeed = prepareSeed(typeString, magicBytes, magicBytesSize, xorPad, baseSeed);
    const derived = drbgGenerateBytes(hmacKey, preparedSeed, 48);
    return {
        aesKey: derived.slice(0, 16),
        aesIV: derived.slice(16, 32),
        hmacKey: derived.slice(32, 48)
    };
}

function decryptAmiibo(tag) {
    tag=isBuffer(tag);
    if(!tag){
        throw new Error(`Tag is not a valid Buffer type`);
    }
    const internal = Buffer.alloc(NFC3D_AMIIBO_SIZE);
    tag.slice(0x008, 0x010).copy(internal, 0x000);
    tag.slice(0x080, 0x0A0).copy(internal, 0x008);
    tag.slice(0x010, 0x034).copy(internal, 0x028);
    tag.slice(0x0A0, 0x208).copy(internal, 0x04C);
    tag.slice(0x034, 0x054).copy(internal, 0x1B4);
    tag.slice(0x000, 0x008).copy(internal, 0x1D4);
    tag.slice(0x054, 0x080).copy(internal, 0x1DC);
    const seed = calcSeed(internal);
    const dataKeys = deriveKeys(Buffer.from("756E666978656420696E666F7300",'hex'), Buffer.from("DB4B9E3F45278F397EFF9B4FB9930000",'hex'), 14, Buffer.from("044917DC76B49640D6F83939960FAED4EF392FAAB21428AA21FB54E545054766",'hex'), Buffer.from("1D164B375B72A55728B91D64B6A3C205",'hex'), seed);
    const tagKeys = deriveKeys(Buffer.from("6C6F636B65642073656372657400",'hex'), Buffer.from("FDC8A07694B89E4C47D37DE8CE5C74C1",'hex'), 16, Buffer.from("044917DC76B49640D6F83939960FAED4EF392FAAB21428AA21FB54E545054766",'hex'), Buffer.from("7F752D2873A20017FEF85C0575904B6D",'hex'), seed);
    const plain = Buffer.alloc(NFC3D_AMIIBO_SIZE);
    const cipher = createDecipheriv('aes-128-ctr', dataKeys.aesKey, dataKeys.aesIV);
    cipher.setAutoPadding(false);
    const decrypted = cipher.update(internal.slice(0x02C, 0x1B4));
    decrypted.copy(plain, 0x02C);
    internal.slice(0x000, 0x008).copy(plain, 0x000);
    internal.slice(0x028, 0x02C).copy(plain, 0x028);
    internal.slice(0x1D4, 0x208).copy(plain, 0x1D4);
    const tagHmac = createHmac('sha256', tagKeys.hmacKey);
    tagHmac.update(plain.slice(0x1D4, 0x208));
    const computedTagHmac = tagHmac.digest();
    computedTagHmac.copy(plain, 0x1B4);
    const dataHmac = createHmac('sha256', dataKeys.hmacKey);
    dataHmac.update(plain.slice(0x029, 0x208));
    const computedDataHmac = dataHmac.digest();
    computedDataHmac.copy(plain, 0x008);
    return plain;
}
function encryptAmiibo(plain) {
    plain=isBuffer(plain);
    if(!plain){
        throw new Error(`Tag is not a valid Buffer type`);
    }
    const seed = calcSeed(plain);
    const dataKeys = deriveKeys(Buffer.from("756E666978656420696E666F7300",'hex'), Buffer.from("DB4B9E3F45278F397EFF9B4FB9930000",'hex'), 14, Buffer.from("044917DC76B49640D6F83939960FAED4EF392FAAB21428AA21FB54E545054766",'hex'), Buffer.from("1D164B375B72A55728B91D64B6A3C205",'hex'), seed);
    const tagKeys = deriveKeys(Buffer.from("6C6F636B65642073656372657400",'hex'), Buffer.from("FDC8A07694B89E4C47D37DE8CE5C74C1",'hex'), 16, Buffer.from("044917DC76B49640D6F83939960FAED4EF392FAAB21428AA21FB54E545054766",'hex'), Buffer.from("7F752D2873A20017FEF85C0575904B6D",'hex'), seed);
    const cipher_internal = Buffer.alloc(NFC3D_AMIIBO_SIZE);
    const tagHmac = createHmac('sha256', tagKeys.hmacKey);
    tagHmac.update(plain.slice(0x1D4, 0x208));
    tagHmac.digest().copy(cipher_internal, 0x1B4);
    const dataHmac = createHmac('sha256', dataKeys.hmacKey);
    dataHmac.update(plain.slice(0x029, 0x1B4));
    dataHmac.update(cipher_internal.slice(0x1B4, 0x1D4));
    dataHmac.update(plain.slice(0x1D4, 0x208));
    dataHmac.digest().copy(cipher_internal, 0x008);
    const aesCipher = createCipheriv('aes-128-ctr', dataKeys.aesKey, dataKeys.aesIV);
    aesCipher.setAutoPadding(false);
    const encrypted = aesCipher.update(plain.slice(0x02C, 0x1B4));
    encrypted.copy(cipher_internal, 0x02C);
    plain.slice(0x000, 0x008).copy(cipher_internal, 0x000);
    plain.slice(0x028, 0x02C).copy(cipher_internal, 0x028);
    plain.slice(0x1D4, 0x208).copy(cipher_internal, 0x1D4);
    const tag = Buffer.alloc(NFC3D_AMIIBO_SIZE);
    cipher_internal.slice(0x000, 0x008).copy(tag, 0x008);
    cipher_internal.slice(0x008, 0x028).copy(tag, 0x080);
    cipher_internal.slice(0x028, 0x04C).copy(tag, 0x010);
    cipher_internal.slice(0x04C, 0x1B4).copy(tag, 0x0A0);
    cipher_internal.slice(0x1B4, 0x1D4).copy(tag, 0x034);
    cipher_internal.slice(0x1D4, 0x1DC).copy(tag, 0x000);
    cipher_internal.slice(0x1DC, 0x208).copy(tag, 0x054);
    return tag;
}

//Extract Mii data from an Amiibo dump
function extractMiiFromAmiibo(dump) {
    const tag = dump.slice(0, NFC3D_AMIIBO_SIZE);
    const decrypted = decryptAmiibo(tag);
    const miiData = decrypted.slice(76, 172);// Extract the 96 Bytes FFSD Mii
    return Buffer.from(miiData);
}

//Insert Mii data into an Amiibo dump
function insertMiiIntoAmiibo(dump, mii) {
    dump=isBuffer(dump);
    if(!dump){
        throw new Error(`Dump is not a valid Buffer type`);
    }
    mii=decodeMii(mii);
    let miiWithChecksum=encodeMii(mii,MiiFormats.FFSD);
    const decrypted = decryptAmiibo(dump.slice(0, NFC3D_AMIIBO_SIZE));//Decrypt the Amiibo
    miiWithChecksum.copy(decrypted, 76);//Insert the Mii into Amiibo
    const encrypted = encryptAmiibo(decrypted);//Reencrypt the Amiibo
    const result = Buffer.alloc(dump.length);
    encrypted.copy(result, 0);
    if (dump.length > NFC3D_AMIIBO_SIZE) {
        dump.slice(NFC3D_AMIIBO_SIZE).copy(result, NFC3D_AMIIBO_SIZE);
    }
    return result;
}

export {
    insertMiiIntoAmiibo,
    extractMiiFromAmiibo
};
