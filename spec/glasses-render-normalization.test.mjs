import assert from "node:assert/strict";
import test from "node:test";

import { normalizeGlassesTypeFor3DSRender } from "../index.js";

const EXPECTED_TYPES = Object.freeze([
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    4, 2, 2, 3, 6, 8, 6, 7, 8, 6, 6
]);

test("normalizes every supported modern glasses type to the legacy render range", () => {
    for (let type = 0; type < EXPECTED_TYPES.length; type += 1) {
        assert.equal(
            normalizeGlassesTypeFor3DSRender(type),
            EXPECTED_TYPES[type],
            `glasses type ${type}`
        );
    }
});

test("rejects glasses types outside the decoded Mii schema", () => {
    for (const type of [-1, 20, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "13"]) {
        assert.throws(
            () => normalizeGlassesTypeFor3DSRender(type),
            /expected 0-19/
        );
    }
});
