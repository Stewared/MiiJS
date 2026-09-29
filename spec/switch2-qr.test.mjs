import assert from "node:assert/strict";
import test from "node:test";

import {
    decryptAmiibo,
    extractMiiFromDecryptedAmiibo
} from "../amiiboHandler.js";
import { decryptSwitch2Mii, encryptSwitch2Mii } from "../miiCrypto.js";

import {
    MiiFormats,
    decodeMii,
    detectMiiFormat,
    encodeMii,
    extractMiiFromAmiibo,
    insertMiiIntoAmiibo
} from "../index.js";

const madisonEncrypted = Buffer.from(
    "9acbcaed435de122a160e11918d71dd49e703c9dfbf0a3492174a12c2d28cbdd" +
    "93afcc791524d533b1f2afdeab29797320710ee9f86edeb8d67dc0629b2c23a9" +
    "c213fd280a2fd938af8ca4470c449a0600240d793010852f394a0e1a3fffb04f6" +
    "a21663f88e08e05e798d674f4e91118119f72aa1baf1948105c938cded39ce1" +
    "451eb5ce4e3fb62a8e6efcf270b7c071",
    "hex"
);

const maddieNfsd = Buffer.from(
    "53502e078c070000000f0f8b0101684e8a8a42140007003042543444" +
    "4d006100640064006900650000000000000000000000000000004000" +
    "800000009c7fbad41e9c0000",
    "hex"
);

test("decrypts and exactly re-encrypts authenticated Switch 2 samples", async () => {
    for (const [encrypted, name, extension] of [
        [madisonEncrypted, "Madison", "00070c0713080800"],
        [Buffer.from(
            "990c215284bc75cbc8fbd716b00a713350d0767684dcf8f5643dd466db1e2fe7" +
            "460c624ae03782fbe38a29096b7af86cc26868b5b402a04f61b274a98435bb0e" +
            "60b4877701c246ab2c7be9e61840eeaecc71063188c59dd6dbfb4eece5870eec" +
            "7084e645e0ac3d998bd0e13305d7e5d01177a672ce81216abba1ce93a8372316" +
            "b26dee1f8ad5ae264d8413556f796de7",
            "hex"
        ), "Aubrey", "00060c0713080800"]
    ]) {
        assert.deepEqual(detectMiiFormat(encrypted), [MiiFormats.FEDEX]);

        const plaintext = decryptSwitch2Mii(encrypted);
        assert.equal(plaintext.length, 0x68);
        assert.equal(plaintext.subarray(0x60).toString("hex"), extension);
        assert.deepEqual(detectMiiFormat(plaintext), [MiiFormats.FSDEX]);
        assert.deepEqual(encryptSwitch2Mii(plaintext), encrypted);

        const decoded = await decodeMii(encrypted);
        assert.equal(decoded.meta.name, name);
        assert.deepEqual(
            [
                decoded.face.color,
                decoded.hair.color,
                decoded.eyes.color,
                decoded.eyebrows.color,
                decoded.mouth.color,
                decoded.beard.color,
                decoded.glasses.color,
                decoded.glasses.type
            ],
            [...Buffer.from(extension, "hex")]
        );
        for (const format of [MiiFormats.FEDEX, ".fedex"]) {
            assert.deepEqual(await encodeMii(decoded, format), encrypted);
        }
        for (const format of [MiiFormats.FSDEX, ".fsdex"]) {
            assert.deepEqual(await encodeMii(decoded, format), plaintext);
        }
    }
});

test("rejects a modified Switch 2 authentication tag", async () => {
    const modified = Buffer.from(madisonEncrypted);
    modified[modified.length - 1] ^= 0x80;
    assert.throws(
        () => decryptSwitch2Mii(modified),
        /Invalid Switch 2 Mii QR extension/i
    );
});

test("converts native StoreData to a valid Switch 2 payload", async () => {
    const source = await decodeMii(maddieNfsd);
    const encrypted = await encodeMii(source, MiiFormats.FEDEX);
    const decoded = await decodeMii(encrypted);

    assert.equal(encrypted.length, 0x90);
    assert.equal(decoded.meta.name, "Maddie");
    assert.equal(decoded.general.height, 80);
    assert.deepEqual(
        [decoded.mouth.color, decoded.beard.color, decoded.glasses.color],
        [0, 0, 0]
    );
});

test("preserves the NFP color extension when inserting/extracting Amiibo data", async () => {
    const source = await decodeMii(maddieNfsd);
    assert.throws(
        () => encodeMii(source, MiiFormats.NTAG),
        /does not have a struct definition for encoding/i
    );
    const tag = await insertMiiIntoAmiibo(Buffer.alloc(540), source);
    const extracted = await extractMiiFromAmiibo(tag);
    const decoded = await decodeMii(tag);
    const internal = decryptAmiibo(tag.subarray(0, 520));
    const invalidSettings = Buffer.from(internal);
    invalidSettings[0xD8] ^= 0x80;

    assert.equal(extracted.length, 0x68);
    assert.deepEqual(detectMiiFormat(extracted), [MiiFormats.FSDEX]);
    assert.equal((await extractMiiFromAmiibo(tag, { legacyVer3Only: true })).length, 0x60);
    assert.equal(extractMiiFromDecryptedAmiibo(invalidSettings).length, 0x60);
    assert.equal(extracted.subarray(0x60).toString("hex"), "00070c0700000000");
    let crc = 0xFFFFFFFF;
    for (const byte of Buffer.concat([internal.subarray(0x4C, 0xAC), internal.subarray(0xBA, 0xD8)])) {
        crc ^= byte;
        for (let bit = 0; bit < 8; ++bit) crc = (crc & 1) ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1;
    }
    assert.equal(internal.readUInt32BE(0xD8), (crc ^ 0xFFFFFFFF) >>> 0);
    assert.deepEqual(
        [decoded.mouth.color, decoded.beard.color, decoded.glasses.color],
        [0, 0, 0]
    );
});
