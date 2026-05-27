import { AES_CCM } from "./asmCrypto.js";
import { createCipheriv, createDecipheriv, randomBytes } from "./platform.js";

/** AES-128-CCM key used for encrypting/decrypting Mii QR code data. */
const AES_CCM_KEY = new Uint8Array([0x59, 0xFC, 0x81, 0x7E, 0x64, 0x46, 0xEA, 0x61, 0x90, 0x34, 0x7B, 0x20, 0xE9, 0xBD, 0xCE, 0x52]);

/**
* Key used for Miitomo/Tomodachi Life QR code encryption.
* From Arian Kordi: https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L30
*/
const AES_CTR_KEY = new Uint8Array([0x30, 0x81, 0x9F, 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01]);

// Below two functions are from: https://github.com/kazuki-4ys/kazuki-4ys.github.io/blob/148dc339974f8b7515bfdc1395ec1fc9becb68ab/web_apps/MiiInfoEditorCTR/encode.js#L20-L44

const WRAPPED_MII_DATA_LENGTH = 112;
const VER3_STORE_DATA_LENGTH = 96;
const WRAPPED_NONCE_LENGTH = 12;
const WRAPPED_TAG_LENGTH = 16;
const WRAPPED_ID_OFFSET = 12;
const WRAPPED_ID_LENGTH = 8;
const AES_IV_LENGTH = 16;

function Uint8Cat(...arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
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

// https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L169-L207
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

// https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L530-L559
function encryptAesCtr(dataU8) {
  const iv = randomBytes(AES_IV_LENGTH); // Buffer
  const cipher = createCipheriv("aes-128-ctr", Buffer.from(AES_CTR_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(dataU8)), cipher.final()]);
  return { encryptedData: new Uint8Array(encrypted), iv: new Uint8Array(iv) };
}

function decryptAesCtr(encryptedU8, ivU8) {
  const decipher = createDecipheriv("aes-128-ctr", Buffer.from(AES_CTR_KEY), Buffer.from(ivU8));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedU8)), decipher.final()]);
  return new Uint8Array(decrypted);
}

// https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L51-L75
function decryptAesCcm(encryptedData) {
  // Source: https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L321
  const nonce = Uint8Cat(encryptedData.subarray(0, WRAPPED_ID_LENGTH), new Uint8Array(4));
  const ciphertext = encryptedData.subarray(WRAPPED_ID_LENGTH, encryptedData.length);
  const plaintext = AES_CCM.decrypt(ciphertext, AES_CCM_KEY, nonce, undefined, 16);
  const result = Uint8Cat(
    plaintext.subarray(0, WRAPPED_NONCE_LENGTH),
    encryptedData.subarray(0, WRAPPED_ID_LENGTH),
    plaintext.subarray(WRAPPED_NONCE_LENGTH, WRAPPED_NONCE_LENGTH + 76),
  );
  return result;
}

function encryptAesCcm(storeData) {
  // Source: https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L396
  const idEndOffset = WRAPPED_ID_OFFSET + WRAPPED_ID_LENGTH;
  const wrappedID = storeData.subarray(WRAPPED_ID_OFFSET, idEndOffset);
  const content = new Uint8Array(VER3_STORE_DATA_LENGTH);
  content.set(storeData.subarray(0, WRAPPED_ID_OFFSET));
  content.set(storeData.subarray(idEndOffset), WRAPPED_ID_OFFSET);
  const nonce = Uint8Cat(wrappedID, new Uint8Array(4));
  const ciphertext = AES_CCM.encrypt(content, AES_CCM_KEY, nonce, undefined, 16);
  const correctEncryptedContentLength = ciphertext.length - WRAPPED_ID_LENGTH - WRAPPED_TAG_LENGTH;
  const encryptedContentCorrected = ciphertext.subarray(0, correctEncryptedContentLength);
  const tag = ciphertext.subarray(ciphertext.length - WRAPPED_TAG_LENGTH);
  return Uint8Cat(wrappedID, encryptedContentCorrected, tag);
}

function decryptMii(data) {
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  
  // Extra data present (Tomodachi Life etc.)
  if (uint8Data.length > WRAPPED_MII_DATA_LENGTH) {
    // https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L694
    const storeData = decryptAesCcm(uint8Data.subarray(0, WRAPPED_MII_DATA_LENGTH));
    const ivOffset = WRAPPED_MII_DATA_LENGTH + AES_IV_LENGTH;
    const iv = uint8Data.subarray(WRAPPED_MII_DATA_LENGTH, ivOffset);
    const encryptedExtra = uint8Data.subarray(ivOffset);
    
    try {
      const decryptedExtra = decryptAesCtr(encryptedExtra, iv);
      
      const extraData = decryptedExtra.subarray(0, -4);
      const crcOffset = decryptedExtra.length - 4;
      const crcActual = new DataView(decryptedExtra.buffer, decryptedExtra.byteOffset, decryptedExtra.byteLength)
      .getUint32(crcOffset, true);
      
      // CRC expected over (wrapped112 || extraData)
      const encryptedForCrc = new Uint8Array(uint8Data.length); // copy
      encryptedForCrc.set(uint8Data, 0);
      encryptedForCrc.set(extraData, WRAPPED_MII_DATA_LENGTH);
      const offsetForCrc = WRAPPED_MII_DATA_LENGTH + extraData.length;
      const dataForCrc = encryptedForCrc.subarray(0, offsetForCrc);
      
      const crcExpected = crc32(dataForCrc);
      return Buffer.from(Uint8Cat(storeData, extraData));
    } catch {
      return Buffer.from(storeData);
    }
  }
  
  return Buffer.from(decryptAesCcm(uint8Data));
}

function encryptMii(data) {
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  
  if (uint8Data.length > VER3_STORE_DATA_LENGTH) {
    // https://github.com/ariankordi/my-jsfiddles/blob/c833be14f1674240e310453cdfa3db5ede53e059/mii-tomo-dachi-topia-qr-tool/script.js#L628
    const storeData = uint8Data.subarray(0, VER3_STORE_DATA_LENGTH);
    const extraData = uint8Data.subarray(VER3_STORE_DATA_LENGTH);
    
    const encryptedBase = encryptAesCcm(storeData);
    
    // CRC32 covers (wrapped112 + plaintext extraData)
    const dataForCrc = new Uint8Array(WRAPPED_MII_DATA_LENGTH + extraData.length);
    dataForCrc.set(encryptedBase, 0);
    dataForCrc.set(extraData, WRAPPED_MII_DATA_LENGTH);
    const crc = miiCrcCalc(dataForCrc, 32) >>> 0;
    
    const extraWithCrc = new Uint8Array(extraData.length + 4);
    extraWithCrc.set(extraData, 0);
    new DataView(extraWithCrc.buffer).setUint32(extraData.length, crc, true);
    
    const { encryptedData: encryptedExtra, iv } = encryptAesCtr(extraWithCrc);
    
    const encryptedBytes = new Uint8Array(WRAPPED_MII_DATA_LENGTH + AES_IV_LENGTH + encryptedExtra.length);
    encryptedBytes.set(encryptedBase, 0);
    encryptedBytes.set(iv, WRAPPED_MII_DATA_LENGTH);
    encryptedBytes.set(encryptedExtra, WRAPPED_MII_DATA_LENGTH + AES_IV_LENGTH);
    
    return Buffer.from(encryptedBytes);
  }
  
  return Buffer.from(encryptAesCcm(uint8Data));
}


function miiCrcCalc(dat, mode = 16) {
  return mode === 32 ? crc32(dat) : crc16(dat);
}

const STUDIO_MII_DATA_LENGTH = 0x2e;
const ENCRYPTED_STUDIO_MII_DATA_LENGTH = STUDIO_MII_DATA_LENGTH + 1;

function studioBytes(data, label) {
  if (typeof data === "string") {
    const hex = data.trim().replace(/\s+/g, "");
    if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) {
      throw new Error(`${label} must be bytes or an even-length hex string.`);
    }
    return Buffer.from(hex, "hex");
  }
  if (
    data instanceof Uint8Array
    || data instanceof ArrayBuffer
    || (typeof SharedArrayBuffer !== "undefined" && data instanceof SharedArrayBuffer)
  ) {
    return Buffer.from(data);
  }
  throw new Error(`${label} must be bytes or an even-length hex string.`);
}

function assertStudioLength(bytes, expectedLength, label) {
  if (bytes.length !== expectedLength) {
    throw new Error(`${label} expected ${expectedLength} bytes, received ${bytes.length}.`);
  }
}

function encryptStudio2(unencryptedMNMS, seed = 0) {
  const bytes = studioBytes(unencryptedMNMS, "MNMS data");
  assertStudioLength(bytes, STUDIO_MII_DATA_LENGTH, "MNMS data");

  const encrypted = Buffer.alloc(ENCRYPTED_STUDIO_MII_DATA_LENGTH);
  encrypted[0] = seed & 0xff;

  for (let i = 0; i < bytes.length; i++) {
    encrypted[i + 1] = (((encrypted[i] ^ bytes[i]) + 0x07) & 0xff);
  }

  return encrypted;
}
function decryptStudio2(encryptedMNMS) {
  const encrypted = studioBytes(encryptedMNMS, "EMNMS data");
  assertStudioLength(encrypted, ENCRYPTED_STUDIO_MII_DATA_LENGTH, "EMNMS data");

  const decrypted = Buffer.alloc(STUDIO_MII_DATA_LENGTH);

  for (let i = 1; i < encrypted.length; i++) {
    decrypted[i - 1] = encrypted[i - 1] ^ ((encrypted[i] - 0x07) & 0xff);
  }

  return decrypted;
}

export {
  decryptMii,
  encryptMii,
  miiCrcCalc,
  
  encryptStudio2,
  decryptStudio2
};
