import assert from "node:assert/strict";
import test from "node:test";

import {
    MiiConversionError,
    MiiFormats,
    convertCharInfoToCharInfoEx,
    convertMii,
    decodeLtdMii,
    decodeMii,
    encodeLtdMii,
    parseCharInfoEx,
    projectReviewedLtdCharInfoToCharInfo
} from "../index.js";
import reviewedLtdCharInfoBackport from "../ltdCharInfoBackportData.js";

const DEFAULT_CHARINFO = Buffer.from(
    "000000000000400080000000000000006e006f0020006e0061006d006500000000000000000000000040400000000000002101000208040304020c0601040306020a010409171304030d080000040a0008040a0004021400",
    "hex"
);

function makeSource(overrides = {}) {
    return Object.assign(parseCharInfoEx(convertCharInfoToCharInfoEx(DEFAULT_CHARINFO)), overrides);
}

function project(overrides = {}, options = {}) {
    return decodeMii(projectReviewedLtdCharInfoToCharInfo(makeSource(overrides), options));
}

function makeLtd(overrides = {}) {
    const fields = decodeLtdMii(Buffer.from(
        "AwAAAJgAAADJe+JVoSRB6LAax11Z4VJHSgBvAGgAbgAgAEQAbwBlAAAAAAAAAAAAQj0AAABkAAYDAg8BBgEHFwBZBgMBDAEjBQQGFTMACAgAAAAAAgQCCAMDAwMMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAwMGBAoBBAkTEwQDAA0ACAAIAAgEAwoACAQDCgAIBAMULQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEoAbwBoAG4AIABEAG8AZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACjo6OjpKSkpA==",
        "base64"
    ));
    delete fields.ltd.canonicalProjection;
    Object.assign(fields.ltd.charInfo, overrides);
    return Buffer.from(encodeLtdMii(fields));
}

test("bundles the completed current review catalog", () => {
    assert.equal(reviewedLtdCharInfoBackport.complete, true);
    assert.equal(
        reviewedLtdCharInfoBackport.catalogHash,
        "7aa65ccd6c611564b8da1a9a50e0931b5b512138273ad9026ee74d8575df8322"
    );
    assert.equal(
        reviewedLtdCharInfoBackport.sourceSha256,
        "92609c67cc2f2d01693c1feaadae5bd126a6368bd00688bed7db29ef6b2f661d"
    );
    assert.equal(Object.keys(reviewedLtdCharInfoBackport.tables.hair.hairType).length, 303);
    assert.deepEqual(
        reviewedLtdCharInfoBackport.tables.hair.hairType[206].patch,
        { "hair.type": 97 }
    );
    assert.equal(Object.keys(reviewedLtdCharInfoBackport.tables.hair.hairFrontType).length, 83);
});

test("reviewed projection uses mapped Bangs first and otherwise falls back to reviewed Back/base", () => {
    assert.equal(project({ hairType: 132, hairFrontType: 3 }).hair.type, 40);
    assert.equal(project({ hairType: 0, hairFrontType: 1 }).hair.type, 130);
    assert.equal(project({ hairType: 0, hairFrontType: 3 }).hair.type, 40);
    assert.equal(project({ hairType: 132, hairFrontType: 1 }).hair.type, 130);
    assert.equal(project({ hairType: 33, hairFrontType: 0 }).hair.type, 33);
    assert.equal(project({ hairType: 14, hairFrontType: 4 }).hair.type, 14);
    assert.equal(project({ hairType: 45, hairFrontType: 0 }).hair.type, 45);
    assert.equal(project({ hairType: 132, hairFrontType: 0 }).hair.type, 14);
    assert.equal(project({ hairType: 132, hairFrontType: 4 }).hair.type, 14);
    assert.equal(project({ hairType: 206, hairFrontType: 0 }).hair.type, 97);
    assert.equal(project({ hairType: 206, hairFrontType: 4 }).hair.type, 97);
    assert.equal(project({ hairType: 206, hairFrontType: 3 }).hair.type, 40);
    assert.equal(project({ hairType: 34, hairFrontType: 3 }).hair.type, 40);
    assert.throws(
        () => project({ hairType: 34, hairFrontType: 0 }),
        error => error instanceof MiiConversionError && error.code === "unsupported_ltd_selector"
    );

    assert.equal(project({
        hairType: 132,
        hairFrontType: 3,
        hairColorPrimary: 12,
        hairColorSecondary: 34,
        faceFlagsRaw: 0x04
    }).hair.color, 12);
    assert.equal(project({
        hairType: 0,
        hairFrontType: 1,
        hairColorPrimary: 12,
        hairColorSecondary: 34,
        faceFlagsRaw: 0x08
    }).hair.color, 34);
    assert.equal(project({
        hairType: 206,
        hairFrontType: 4,
        hairColorPrimary: 12,
        hairColorSecondary: 34,
        faceFlagsRaw: 0x04
    }).hair.color, 34);
    assert.equal(project({
        hairType: 206,
        hairFrontType: 3,
        hairColorPrimary: 12,
        hairColorSecondary: 34,
        faceFlagsRaw: 0x08
    }).hair.color, 34);
});

test("reviewed projection merges full beard, stubble, and layered face parts", () => {
    const merged = project({
        beardType: 9,
        beardColor: 41,
        stubbleType: 5,
        stubbleColor: 42,
        makeupUpperType: 0,
        makeupLowerType: 0,
        wrinkleUpperType: 4,
        wrinkleLowerType: 8
    });
    assert.equal(merged.beard.type, 1);
    assert.equal(merged.beard.color, 41);
    assert.equal(merged.face.makeup, 11);
    assert.equal(merged.face.feature, 11);

    const finalMakeup = project({
        beardType: 9,
        stubbleType: 5,
        makeupUpperType: 1,
        makeupLowerType: 2
    });
    assert.equal(finalMakeup.beard.type, 1);
    assert.equal(finalMakeup.face.makeup, 6);
});

test("reviewed projection applies Nothing geometry after direct fields", () => {
    const nothing = project({
        eyeType: 60,
        eyebrowType: 23,
        eyebrowScale: 8,
        eyebrowAspect: 6,
        eyebrowX: 14,
        eyebrowY: 18,
        noseType: 19,
        noseScale: 8,
        noseY: 18,
        mouthType: 36,
        mouthScale: 8,
        mouthAspect: 6,
        mouthY: 18,
        mustacheType: 0,
        mustacheScale: 8,
        mustacheY: 16,
        glassPrimaryType: 0,
        glassLensMaterialMode: 0,
        glassScale: 7,
        glassY: 20
    });
    assert.deepEqual(
        [nothing.eyes.size, nothing.eyes.squash, nothing.eyes.yPosition, nothing.eyes.distanceApart],
        [0, 0, 0, 0]
    );
    assert.deepEqual(
        [nothing.eyebrows.size, nothing.eyebrows.squash, nothing.eyebrows.yPosition, nothing.eyebrows.distanceApart],
        [0, 0, 0, 0]
    );
    assert.deepEqual([nothing.nose.size, nothing.nose.yPosition], [0, 0]);
    assert.deepEqual([nothing.mouth.size, nothing.mouth.squash, nothing.mouth.yPosition], [0, 0, 0]);
    assert.deepEqual([nothing.beard.mustache.size, nothing.beard.mustache.yPosition], [0, 0]);
    assert.deepEqual([nothing.glasses.size, nothing.glasses.yPosition], [0, 0]);
});

test("reviewed projection forwards core eye color and layout", () => {
    const eyes = project({
        eyeType: 61,
        eyeColor: 99,
        eyeScale: 7,
        eyeAspect: 6,
        eyeRotate: 7,
        eyeX: 12,
        eyeY: 18
    }).eyes;
    assert.deepEqual(eyes, {
        type: 23,
        color: 99,
        size: 7,
        squash: 6,
        rotation: 7,
        distanceApart: 12,
        yPosition: 18
    });
});

test("forward eye conversion keeps core values and derives LTD eye accessories", () => {
    const charInfo = Buffer.from(DEFAULT_CHARINFO);
    charInfo.set([45, 76, 7, 6, 7, 12, 18], 0x34);
    let expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.deepEqual(Array.from(expanded.subarray(0x4e, 0x55)), [45, 76, 7, 6, 7, 12, 18]);
    assert.equal(expanded[0x62], 1);

    charInfo[0x34] = 10;
    charInfo[0x37] = 1;
    expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.deepEqual(Array.from(expanded.subarray(0x56, 0x59)), [3, 4, 5]);
    assert.equal(expanded[0x5c], 3);

    charInfo[0x34] = 20;
    expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.equal(expanded[0x2b] & 0x10, 0x10);
    assert.equal(expanded[0x5c], 2);

    charInfo[0x34] = 0;
    expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.equal(expanded[0x2b] & 0x10, 0);
    assert.equal(expanded[0x5c], 1);

    charInfo[0x34] = 35;
    expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.equal(expanded[0x5c], 3);

    charInfo[0x34] = 53;
    expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.equal(expanded[0x68], 1);

    charInfo[0x34] = 21;
    expanded = convertCharInfoToCharInfoEx(charInfo);
    assert.equal(expanded[0x6e], 1);
});

test("reviewed projection preserves every directly representable field", () => {
    const direct = project({
        fontRegion: 3,
        gender: 1,
        height: 91,
        build: 72,
        regionMove: 3,
        faceFlagsRaw: 0x83,
        eyebrowType: 1,
        eyebrowColor: 31,
        eyebrowScale: 8,
        eyebrowAspect: 6,
        eyebrowRotate: 11,
        eyebrowX: 14,
        eyebrowY: 18,
        noseType: 1,
        noseScale: 8,
        noseY: 18,
        mouthType: 1,
        mouthColor: 32,
        mouthScale: 8,
        mouthAspect: 6,
        mouthY: 18,
        mustacheType: 1,
        mustacheColor: 33,
        mustacheScale: 8,
        mustacheY: 16,
        glassPrimaryType: 1,
        glassLensMaterialMode: 0,
        glassPrimaryColor: 34,
        glassScale: 7,
        glassY: 20,
        moleScale: 8,
        moleX: 16,
        moleY: 30
    }, { favoriteColor: 7 });
    assert.deepEqual(direct.general, { favoriteColor: 7, gender: 1, height: 91, weight: 72 });
    assert.equal(direct.meta.charset, 3);
    assert.equal(direct.meta.type, "Special");
    assert.equal(direct.meta.region, 3);
    assert.equal(direct.hair.flipped, true);
    assert.deepEqual(direct.eyebrows, {
        type: 1,
        color: 31,
        size: 8,
        squash: 6,
        rotation: 11,
        distanceApart: 12,
        yPosition: 15
    });
    assert.deepEqual(direct.nose, { type: 1, size: 8, yPosition: 18 });
    assert.deepEqual(direct.mouth, { type: 1, color: 32, size: 8, squash: 6, yPosition: 18 });
    assert.deepEqual(direct.beard.mustache, { type: 1, size: 8, yPosition: 16 });
    assert.deepEqual(direct.glasses, { type: 1, color: 34, size: 7, yPosition: 20 });
    assert.deepEqual(direct.mole, { on: true, size: 8, xPosition: 16, yPosition: 30 });
});

test("reviewed projection selects active shared color carriers", () => {
    assert.equal(project({
        beardType: 0,
        stubbleType: 4,
        stubbleColor: 37,
        mustacheType: 1,
        mustacheColor: 52
    }).beard.color, 37);
    assert.equal(project({
        beardType: 0,
        stubbleType: 1,
        mustacheType: 1,
        mustacheColor: 52
    }).beard.color, 52);
    assert.equal(project({
        glassPrimaryType: 3,
        glassLensMaterialMode: 0,
        glassPrimaryColor: 23,
        glassLensColor: 67
    }).glasses.color, 23);
    assert.equal(project({
        glassPrimaryType: 13,
        glassLensMaterialMode: 2,
        glassPrimaryColor: 23,
        glassLensColor: 67
    }).glasses.color, 67);
});

test("reviewed projection defaults missing CHARINFO metadata and accepts explicit values", () => {
    const defaulted = projectReviewedLtdCharInfoToCharInfo(makeSource());
    const explicit = projectReviewedLtdCharInfoToCharInfo(makeSource(), {
        favoriteColor: 7,
        unknownByte57: 91
    });
    assert.equal(defaulted[0x27], 0);
    assert.equal(defaulted[0x57], 0);
    assert.equal(explicit[0x27], 7);
    assert.equal(explicit[0x57], 91);
});

test("reviewed projection fails closed for selectors outside its audited domains", () => {
    assert.throws(
        () => projectReviewedLtdCharInfoToCharInfo(makeSource({ facelineType: 12 })),
        error => error instanceof MiiConversionError && error.code === "unsupported_ltd_selector"
    );
    assert.throws(
        () => projectReviewedLtdCharInfoToCharInfo(makeSource({ hairColorSecondary: 100 })),
        error => error instanceof MiiConversionError && error.code === "unsupported_ltd_selector"
    );
    assert.throws(
        () => projectReviewedLtdCharInfoToCharInfo(makeSource({ eyeColor: 100 })),
        error => error instanceof MiiConversionError && error.code === "unsupported_ltd_selector"
    );
    assert.throws(
        () => projectReviewedLtdCharInfoToCharInfo(makeSource({ hairType: 341, hairFrontType: 4 })),
        error => error instanceof MiiConversionError && error.code === "unsupported_ltd_selector"
    );
    assert.throws(
        () => projectReviewedLtdCharInfoToCharInfo(makeSource({ hairType: 34, hairFrontType: 0 })),
        error => error instanceof MiiConversionError && error.code === "unsupported_ltd_selector"
    );
});

test("convertMii uses review tables only in approximate mode", async () => {
    const source = makeLtd({
        hairType: 132,
        hairFrontType: 3,
        beardType: 9,
        stubbleType: 5,
        wrinkleUpperType: 4,
        wrinkleLowerType: 8
    });
    const converted = await convertMii(source, MiiFormats.CHARINFO, { mode: "approximate" });
    assert.equal(converted.data.length, 88);
    assert.equal(converted.fields.hair.type, 40);
    assert.equal(converted.fields.beard.type, 1);
    assert.equal(converted.fields.face.feature, 11);
    assert.equal(converted.report.status, "converted");
    assert.equal(converted.report.fields.approximated.at(-1).code, "reviewed_ltd_char_info_projection");
    assert.equal(converted.report.verification.strategy, "completed-human-review-and-regenerate");

    await assert.rejects(
        convertMii(source, MiiFormats.CHARINFO, { mode: "source-backed" }),
        error => error instanceof MiiConversionError && error.code === "noninvertible_char_info_ex"
    );
    await assert.rejects(
        convertMii(makeLtd({ facelineType: 12 }), MiiFormats.CHARINFO, { mode: "approximate" }),
        error => error instanceof MiiConversionError
            && error.code === "unsupported_ltd_selector"
            && error.report?.status === "rejected"
    );
});

test("source-backed exact inverse remains byte-exact and exact mode still rejects the LTD envelope", async () => {
    const fields = decodeLtdMii(makeLtd());
    delete fields.ltd.canonicalProjection;
    fields.ltd.charInfo = parseCharInfoEx(convertCharInfoToCharInfoEx(DEFAULT_CHARINFO));
    const source = Buffer.from(encodeLtdMii(fields));
    const converted = await convertMii(source, MiiFormats.CHARINFO, {
        mode: "source-backed",
        legacyTemplate: DEFAULT_CHARINFO
    });
    assert.deepEqual(converted.data, DEFAULT_CHARINFO);
    assert.equal(converted.report.fields.approximated.length, 0);

    await assert.rejects(
        convertMii(source, MiiFormats.CHARINFO, {
            mode: "exact",
            legacyTemplate: DEFAULT_CHARINFO
        }),
        error => error instanceof MiiConversionError && error.code === "lossy_conversion"
    );
});

test("reviewed projection does not mutate decoded LTD input", () => {
    const fields = decodeLtdMii(makeLtd({ hairType: 132, hairFrontType: 3 }));
    const before = JSON.stringify(fields.ltd.charInfo);
    projectReviewedLtdCharInfoToCharInfo(fields);
    assert.equal(JSON.stringify(fields.ltd.charInfo), before);
});
