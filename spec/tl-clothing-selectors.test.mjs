import test from "node:test";
import assert from "node:assert/strict";
import nodeCrypto from "node:crypto";

if (typeof globalThis.crypto?.createHmac !== "function") {
    Object.defineProperty(globalThis, "crypto", {
        value: nodeCrypto,
        configurable: true
    });
}

const {
    Mii,
    MiiFormats,
    decodeMii,
    decryptMii,
    detectMiiFormat,
    encodeMii
} = await import("../index.js");

const tlcFixture = Buffer.from(
    "AwEAMAAAAAAAAAAAFCURxqTA4ZsK3wAAWQJDAGgAcgBpAHMAdABpAG4AYQAAAB4GAUBlB6omRBbDEmcSIxIbZwwAACkAUkhQTgBpAG4AdABlAG4AZABvAAAAAABDAGgAcgBpAHMAdABpAG4AYQAAAAAAAAAAAAAAAAAAAEEAZwB1AGkAbABlAHIAYQAAAAAAAAAAAAAAAAAAAAAAwDIAWgAAAAAAAAAAAAAAAFMAaQBuAGcAIABzAHQAcgBvAG4AZwAhAAAAAAAAAAAAAACJAW8AAAAAAAAAAAAAACGX1EMAAAAAAAAAAAAAAAAhl9RDAAAAAAAAAAAAAAAAFCURxqTA4ZsK3zQmOhkZAAQEBAQEBQg6BXSgEQu5wHYA/v8PIP//DwAAAAAAAAAAIZfUQwAAAABOAGkAbgB0AGUAbgBkAG8AAAAAAHaiaIs=",
    "base64"
);

test("Tomodachi Life clothing selectors survive TLC, TLS, TLE, and Mii round trips", async () => {
    assert.equal(tlcFixture.length, 332);

    const patchedTlc = Buffer.from(tlcFixture);
    let appearanceWord = patchedTlc.readUInt32LE(0x9C);
    appearanceWord = (appearanceWord & ~0x003FC000) | (0xB << 14) | (0xD << 18);
    patchedTlc.writeUInt32LE(appearanceWord >>> 0, 0x9C);

    assert.ok(detectMiiFormat(patchedTlc).includes(MiiFormats.TLC));
    const decoded = await decodeMii(patchedTlc);
    assert.equal(decoded.tl.clothing.outfitColor, 0xB);
    assert.equal(decoded.tl.clothing.hatColor, 0xD);
    assert.equal(decoded.tl.clothing.outfit, "8901");
    assert.equal(decoded.tl.clothing.hat, "6F00");
    assert.equal(decoded.general.birthMonth, 12);
    assert.equal(decoded.general.birthday, 18);
    assert.equal(decoded.tl.isAdult, true);
    assert.deepEqual(decoded.tl.hairDye, { color: 13, mode: 1 });

    let encryptedTle;
    for (const [format, offset] of [
        [MiiFormats.TLC, 0x9C],
        [MiiFormats.TLS, 0xA0],
        [MiiFormats.TLE, 0xA0]
    ]) {
        const encoded = await encodeMii(decoded, format);
        assert.ok(detectMiiFormat(encoded).includes(format));

        const clear = format === MiiFormats.TLE ? await decryptMii(encoded) : encoded;
        const packed = clear.readUInt32LE(offset);
        assert.equal((packed >>> 14) & 0xF, 0xB);
        assert.equal((packed >>> 18) & 0xF, 0xD);

        const roundTripped = await decodeMii(encoded);
        assert.equal(roundTripped.tl.clothing.outfitColor, 0xB);
        assert.equal(roundTripped.tl.clothing.hatColor, 0xD);
        assert.equal(roundTripped.general.birthMonth, 12);
        assert.equal(roundTripped.general.birthday, 18);
        assert.equal(roundTripped.tl.isAdult, true);
        assert.deepEqual(roundTripped.tl.hairDye, { color: 13, mode: 1 });

        if (format === MiiFormats.TLE) encryptedTle = encoded;
    }

    const instance = await Mii.create(encryptedTle);
    assert.equal(instance.fields.tl.clothing.outfitColor, 0xB);
    assert.equal(instance.fields.tl.clothing.hatColor, 0xD);

    const withoutSelectors = structuredClone(decoded);
    delete withoutSelectors.tl.clothing.outfitColor;
    delete withoutSelectors.tl.clothing.hatColor;
    const defaultedTls = await encodeMii(withoutSelectors, MiiFormats.TLS);
    const defaultedWord = defaultedTls.readUInt32LE(0xA0);
    assert.equal((defaultedWord >>> 14) & 0xF, 0);
    assert.equal((defaultedWord >>> 18) & 0xF, 0);
});
