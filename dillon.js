import reviewedLtdCharInfoBackport from "./ltdCharInfoBackportData.js";
import { fs, isNode } from "./platform.js";

/** Animal names indexed by the game's enum ID; zero means no animal. */
export const DILLON_AMIIMAL_TYPES = Object.freeze([
    null, "Bull", "Fox", "Wolf", "Sheep", "Duck", "Cat", "Rabbit", "Mouse", "Bear", "Tiger"
]);
// Eleven triangle references followed by the ten signed scoring tables.
// Signed penalties, including -99, and the original nose-table stride matter.
const DATA = new Int8Array([
    0, 0, 0, 0, 3, 4, 12, 11, 3, 4, 13, 10, 3, 2, 13, 11, 5, 6, 13, 10, 2, 3, 14, 11, 2, 2, 13, 10, 3, 4, 14, 11, 3, 2, 14, 11, 3, 4, 13, 11, 3, 4, 13, 13, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, -9, 0, 4, 1, 2, 2, 4, 2, -9, 0, -9, 3, 5, -9, -9, -9, -9, -9, -9, -9, 6, -9, 4, -9, 6, -9, -9, -9, -9, -9, 0, -9, 4, -9, 3, -9, 2, -9, 4, -9,
    1, -9, 2, 1, 4, -9, 1, 1, 2, 3, -9, -9, 1, -9, -9, -2, -9, 3, 1, -9, 1, 1, -9, 0, 1, 0, 0, 1, -9, 1, -9, -9, 2, 2, -9, -9, 1, -9, -9, -9, 1, 2, 0, -9, 3, 2, -9, -9,
    -9, -9, -9, -9, 4, 2, -9, -9, -9, 3, -9, 4, 2, 2, -9, 3, -9, 3, 1, -9, 3, -9, -9, -9, 4, 3, 0, -9, 2, -9, 4, -9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0,
    0, 0, 2, 4, 0, 0, 0, 0, 4, 0, 3, 2, 0, 2, 2, 3, 0, 2, 0, 2, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0,
    4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0,
    0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 2, 2, 0, 2, 0, 0, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 4, 0,
    2, 0, 0, 3, 0, 0, 0, 3, 0, 3, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 3, 0, 3, 0, 0, 2, 0, 0, 0,
    0, 0, 0, 4, 0, 0, 2, 0, 0, 0, 3, 3, 0, 3, 2, 3, 0, 2, 0, 3, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0,
    0, 2, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 3, 3, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 3, 2, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 3, 3, 0, 0, 0, 2, 3, 2, 2, 0, 5, 0, 5, 3, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0, 3, 3,
    2, 0, 4, 0, 0, 3, 2, 3, 0, 0, 3, 0, 0, 0, 0, 2, 3, 0, 0, 2, 2, 3, 3, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 2, 2, 0, 0, 0, 2, 0, 2, 0, 0,
    3, 0, 2, 0, 2, 3, 2, 0, 0, 3, 2, 0, 3, 2, 0, 0, 2, 2, 3, 4, 2, 2, 2, 2, 3, 0, 2, 0, 3, 2, 0, 2, 0, 2, 3, 0, 0, 2, 2, 2, 3, 2, 0, 0, 0, 0, 0, 0,
    2, 2, 3, 0, 2, 0, 0, 0, 2, 0, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 0, 3, 0, 2, 0, 0, 0, 0, 3, 3, 0, 0, 2, 3, 0, 0, 0, 0,
    0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 2, 0, 0, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 0, 0, 3, 2, 2, 0, 0, 3, 0, 2, 2, 0, 0, 3, 2, 2, 0, 0, 0, 2, 2, 0,
    0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 2, 2, 0, 3, 0, 2, 4, 3, 3, 2, 2, 2, 2, 2, 2, 3, 0, 0, 2, 0, 0, 2, 2, 0, 2,
    0, 0, 2, 2, 0, 0, 2, 3, 0, 0, 2, 2, 0, 2, 3, 0, 0, 3, 2, 1, 0, 0, 0, 2, 3, 2, 0, 0, 2, 2, 0, 2, 0, 1, 2, 0, 3, 2, 3, 0, 0, 2, 2, 2, 2, 0, 2, 2,
    2, 2, 2, 2, 2, 3, 2, 2, 3, 2, 2, 2, 3, 2, 0, 3, 2, 2, 0, 0, 2, 2, 0, 2, 3, 2, 0, 0, 2, 2, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 3, 0, 0, 0, 2, 0,
    2, 2, 0, 0, 0, 0, 0, 0, 2, 3, 2, 2, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 0, 0, 2, 3, 3, 0, 2, 2, 2, 3, 2, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2,
    2, 3, 2, 2, 3, 2, 2, 2, 2, 0, 2, 2, 0, 2, 3, 0, 2, 0, 0, 2, 2, 0, 2, 2, 2, 0, 3, 0, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 2,
    0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 0, 2, 0, 0, 2, 2, 0,
    0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 3, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 3, 0, 2, 2, 0, 2, 0, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2,
    2, 2, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0,
    0, 0, 0, 3, 0, 3, 3, 0, 3, 2, 3, 2, 2, 0, 0, 2, 3, 2, 0, 2, 2, 3, 3, 2, 0, 0, 0, 2, 2, 2, 0, 3, 0, 0, 3, 0, 3, 0, 2, 2, 3, 0, 2, 0, 0, 0, 0, 0,
    3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 2, 2, 0, 2, 2, 3, 2,
    2, 2, 2, 3, 0, 0, 0, 4, 0, 3, 0, 2, 0, 0, 2, 0, 3, 2, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 2, 3, 0, 0, 2, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2,
    2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 2, 0, 2, 2, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, -2, -2, -2, -2, -2, -2, -2, 2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, 1, -2, -2, 1, 2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, -2, 1, 1, -2, 1, -2, -2, -2, -2, -2, -2, 1, 1, -2, -2, -2, -2, -4, -4, -4, -4, -4, -4, 1,
    -2, 1, 1, -2, 1, 1, -2, 1, -2, -2, -2, -2, -2, -2, 0, -2, 0, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 3, -2, 1, 1, -2, 2, -2, -2, -2, 1, -2, 1, -2, -2, -2, 1, -2, -2, 1,
    -2, 1, -2, -2, 3, 1, -2, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, 3, -2, 3, 2, -2, 2, -2, -2, -2, -2, -2, -2, 1, -2, 1, 1, -2, 1, 1, -2, 1, 1, -2, -2, 3, -2, 3, 1, -2, 1, -2,
    -2, -2, -2, -2, -2, 3, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 2, -4, -2, -2, -4, -2, -2, -4, -2, -2, -4, -2, -2, -4, 2, 3, -4, 2, 3, -4, -2, -2, -4, -2, -2, -4, -2,
    -2, -4, -4, -4, -4, -2, -2, -4, -2, -2, -4, -2, 3, -4, 1, 4, -4, -2, -2, -4, -2, -2, -4, -2, -2, -4, -2, -2, -4, -4, -4, -4, 0, 2, -4, 2, 3, -4, 4, 5, -4, 0, 2, -4, 3, 5, -4, -2,
    -2, -4, 2, 5, -4, 3, 5, -4, -2, -2, -4, -2, -2, -4, 3, 5, -4, -2, 1, -4, -2, -2, -4, -2, -2, -4, 1, 4, -4, -2, -2, -4, 3, 5, -4, 2, 3, -4, -2, 2, -4, -2, -2, -4, 0, 2, -4, 1,
    1, -4, -2, 0, -4, 1, 3, -4, -2, -2, -4, -4, -2, -4, -2, -2, -4, 0, 0, -4, 3, 4, -4, 2, 3, -4, 1, 4, -4, -2, 2, -4, -2, -2, -4, 1, 2, -4, -2, -2, -4, -2, 0, -4, -2, 2, -4, -2,
    0, -4, 2, 3, -4, 1, 2, -4, -2, -2, -2, -2, -2, -2, -2, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 4, 1, -2, 1, -2, -2, 2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 3, -2, 1,
    1, 1, 1, 1, 1, -2, -2, -2, -2, -2, -2, 1, 1, 1, -2, -2, -2, -4, -4, -4, -4, -4, -4, 1, 1, 1, 1, 4, 1, 1, 1, 1, -2, -2, -2, -2, -2, -2, 1, 1, 1, 3, 4, -2, -2, -2, -2, -2,
    3, -2, -2, 2, -2, 1, 1, -2, -2, 3, -2, -2, -2, -2, 1, 3, 1, -2, -2, -2, -2, 2, -2, 3, 4, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 3, 3, 2, -2, -2, -2, -4,
    -4, -4, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 3, -2, -2, 3, -2, -2, -2, -2, -2, -2, -2, 1, 1, -2, -2, -2, -2, -2, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 1, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, 1, 1, 1, -2, -2, -2, -2, -2, -2, 1, -2, -2, 1, 1, 1, 1, -2, -2, -2, -2, 1, -2, -2, -2, 1, 1, 1, -2, -2, -2, 1, -2, 1, 2, -2, 2, 1, -2, 1, -2, -2, -2, 1,
    -2, 1, 1, -2, 1, 2, 2, 2, -2, -2, -2, 1, -2, 1, -2, -2, -2, 1, 1, 1, 1, -2, 1, 1, -2, 1, 1, -2, 1, 1, -2, 1, 0, 0, 0, 1, -2, 1, -2, -2, -2, 1, 1, 1, -2, -2, 1, 1,
    -2, 1, 1, 1, 1, 1, -2, 1, -2, -2, -2, -2, -2, 1, 1, -2, 1, 2, 2, 2, -2, 1, 1, 1, -2, 1, -2, -2, 1, 1, 1, 1, 2, -2, 2, -2, -2, -2, 1, -2, 1, 1, 1, 1, 1, -2, 1, -2,
    -2, 1, -2, -2, 1, 2, 1, 2, -2, -2, -2, 1, -2, 1, -2, -2, 1, 1, -2, 1, 1, -2, 1, 1, -2, 1, 1, -2, 1, 1, -2, 1, -2, -2, -2, -2, -2, -2, 1, -2, 1, -2, -2, -2, -2, -2, -2, 1,
    1, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, -2, -2, -2, 2, -2, 2, 2, 2, 2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 2, 1, 1, 1, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 1, 1, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 1, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, -2, 1, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 1, 2, -2, -2, -2, -2, -2, -2, 1, -2, 1, 1, 2, 1, -2, -2, -2, 1, 1, -2, 1, -2, -2, 1, 1, 2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 3, 1, 3, 1, 1, 1, 1, -2, -2, -2, -2, -2, 1, 1, -2, -2, -2, -2, -4, -4, -4, -2, -2, -2, -2, -2, 1, 1, 1, -2, 1, 1, 1, 2, 1, 2, -2,
    -2, -2, 3, 1, 1, 2, 2, 2, 2, 2, 1, 3, 3, 1, 1, 2, -2, 1, 1, 1, -2, -2, -2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, -2, 2, 1, 1, 1, 1, -2, -2, -2, 2, -2,
    -2, -2, 1, 2, 1, 1, 1, -2, 1, 1, -2, -2, -2, -2, 1, -2, -2, 3, 3, 3, 1, 1, 1, 3, 2, 3, -2, -2, -2, -2, -2, -2, 2, -2, -2, 2, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, 1, 2, 1, 2, 1, 1, -2, -2, -2, -2, -2, -2, 2, -2, -2, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, -2, -2, 2, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1,
    -2, 1, 1, -2, 1, 1, -2, 1, -2, -2, -2, 1, -2, 2, -2, -2, -2, -4, -4, -4, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, -2, 1, 1, -2, 1, -2, -2, -2, 1, 1, 2, -2, -2, -2, 0, 0, 0, 0,
    0, 0, -2, -2, -2, -2, -2, -2, 3, -2, -2, 3, 2, 3, 2, 1, 3, 3, 2, 3, 1, 1, -2, 1, -2, 3, 1, -2, -2, -2, -2, -2, 3, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1,
    1, 1, 1, 1, 1, 3, 3, 3, 1, -2, -2, 2, -2, 2, -2, -2, -2, 1, 1, 1, -2, -2, -2, 3, 3, -2, 3, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, 3, 3, -2, 3, 3, 3, -2, -2, -2, 3,
    1, 1, 1, 2, 1, 3, -2, 1, -2, -2, -2, 3, 3, 1, 1, 1, 1, 1, 1, 1, -2, -2, -2, 1, 1, 1, -2, -2, -2, 2, 2, 2, 2, 2, 2, 1, -2, 1, 1, 1, 1, 3, 3, 2, 1, 2, 1, 1,
    1, 1, 3, 3, 3, 2, 2, 2, -2, -2, -2, 1, -2, 1, 1, -2, 2, 1, -2, 1, 1, -2, 1, 1, -2, 2, 1, 1, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 1, 2, -2, -2, -2, -2,
    -2, -2, 1, -2, 1, 2, -2, 1, 1, 3, -2, 1, 1, 2, -2, -2, -2, 1, -2, -2, 2, -2, 1, 2, 2, 3, -2, -2, -2, 1, 1, 1, -2, -2, -2, 1, 1, 1, -2, -2, -2, 2, 2, 2, 1, -2, 1, -2,
    -2, -2, -2, -2, -2, 1, 1, 1, 3, -2, 3, -2, -2, -2, -2, -2, -2, 1, 1, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, -2, 1, -2, -2, -2, -2,
    -2, -2, 1, -2, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 2, -2, -2, -2, -2, -4, -4, -4, -4, -4, -4, 1,
    -2, -2, -2, -2, 1, 1, 1, 1, -2, -2, -2, -2, -2, -2, 1, -2, 1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 3, -2, -2, -2, -2, -2, -2, -2, 2, 1, -2, 1, -2, -2, -2, -2, -2, -2, 3,
    -2, 1, 3, -2, -2, 3, -2, 3, -2, -2, -2, 1, 1, 1, -2, -2, -2, 2, 2, -2, 3, -2, -2, -2, -2, -2, -2, -2, -2, 1, 1, 1, 1, -2, 1, 1, 1, 1, 3, 2, 2, 3, 3, 3, 1, -2, 1, -2,
    -2, -2, -2, -2, -2, 3, 3, 2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 2, 2, -2, -2, -2, -2, -2, -2, 2, 2, -2, 1, 3, 3, 1, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 1, 2, -2, 1, -2, 1, -2, -2, -2, 3, 1, -2, -2, -2, -2, -4, -4, -4, -2, -2, -2, 2, -2, 2, 1, 1, -2, 1, 1, -2, 1, -2, 1, -2,
    -2, -2, 1, 2, 1, 1, 1, 2, 1, 1, -2, 1, 1, -2, -2, 2, -2, 1, 3, -2, -2, -2, -2, 1, 3, 1, 2, 1, 2, 1, 1, 1, 3, 1, -2, 1, 2, 1, -2, 1, -2, 3, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, 1, -2, 1, 1, 1, 1, 3, -2, -2, -2, -2, -2, -2, -2, 1, 1, 1, 2, 2, -2, 1, 2, 1, 2, 1, -2, 1, 1, -2, 1, 2, -2, -2, 1, -2, -2, -2, -2, 1, 1, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2, 4, 0, 4, 4, 0, 4, 4, 0, 4, 4, 0, 1, 3, 0, 4, 2, 0, 4, 3, 0, 4, 4, 0, 4, 4, 0, 4, 4, 0, 4, 3, 0, 4, 5, 0, 4, 3, 0, 4, 4,
    0, 4, 4, 0, 4, 4, 0, 4, 5, 0, 4, 4, 0, 4, 4, 0, 1, 4, 0, 2, 3, 0, 4, 5, 0, 4, 3, 0, 4, 5, 0, 4, 4, 0, 4, 5, 0, 4, 4, 0, 4, 3, 0, 4, 3, 0, 2, 5,
    0, 4, 2, 0, 4, 4, 0, 4, 4, 0, 4, 5, 0, 4, 4, 0, 4, 4, 0, 4, 3, 0, 4, 3, 0, 4, 4, 0, 4, 5, 0, 4, 4, 0, 4, 3, 0, 4, 4, 0, 4, 4, 0, 4, 4, 0, 4, 4,
    0, 4, 4, 0, 2, 4, 0, 0, 4, 0, 4, 5, 0, 4, 4, 0, 4, 4, 0, 4, 4, 0, 4, 3, 0, 4, 4, 0, 4, 4, 0, 4, 4, 0, 4, 4, 0, 4, 3, 0, 4, 4, 0, 4, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 3, 3, 2, 3, 3, 2, 0, 0, 0, 3, 3, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 2,
    2, 1, 3, 3, 2, 3, 3, 2, 1, 2, 1, 1, 2, 1, 0, 0, 0, 2, 4, 3, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 2, 1, 2, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 3, 3, 2, 3, 3, 2, 0, 0, 0, 3, 3, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 2,
    2, 1, 3, 3, 2, 3, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 2, 1, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 3, 5, 4, 3, 5, 4, 3, 4, 3, 2, 4, 3, 2, 4, 2, 1, 5, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 4, 3, 2, 5,
    4, 2, 4, 3, 2, 5, 4, 2, 5, 3, 2, 4, 3, 1, 4, 3, 2, 4, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 1, 0, 0, 0, 0, 1, 0,
    0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0,
    0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3,
    5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3,
    5, 3, 5, 3, 5, 3, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -99, -99, -99, -99,
    -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99,
    -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99,
    -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -99, -99, -99, -99,
    -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99,
    -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99,
    -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, -99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 15, 15, 15,
    14, 15, 15, 15, 15, 14, 14, 14, 15, 16, 14, 15, 15, 15, 15, 15, 14, 15, 15, 15, 15, 15, 16, 15, 15, 15, 15, 15, 15, 15, 16, 15, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
]);
const DILLON_TABLES = {
    scoreOffsets: [44, 176, 1628, 3608, 3788, 4382, 4436, 4832, 4904, 5564],
    limits: {
        faceType: 11, hairType: 131, eyeType: 59, eyeAspect: 6,
        eyeRotate: 7, eyeX: 12, eyeY: 18, noseType: 17, noseScale: 8,
        noseY: 18, mouthType: 35, mouthScale: 8
    },
    faceAnchors: [
        { hair: [0, 0, 0], nose: [0, 24.5, 26], beard: [0, 0, 0] },
        { hair: [0, 0, 0], nose: [0, 24.5, 26], beard: [0, 0.5099999904632568, 0.05000000074505806] },
        { hair: [0, 3, 0], nose: [0, 27.5, 26], beard: [0, -1.7100000381469727, -1.309999942779541] },
        { hair: [0, 0, 0], nose: [0, 24.5, 26], beard: [0, -3.109999895095825, 1.8200000524520874] },
        { hair: [0, 0, 0], nose: [0, 24.5, 26.5], beard: [0, -0.9900000095367432, 2.5199999809265137] },
        { hair: [0, 0, 0], nose: [0, 24.5, 26], beard: [0, -0.9200000166893005, 3.6700000762939453] },
        { hair: [0, 3, 0], nose: [0, 27.5, 26], beard: [0, -2.6500000953674316, 1.2699999809265137] },
        { hair: [0, 3, 0], nose: [0, 27.5, 26], beard: [0, -2.4800000190734863, -0.6000000238418579] },
        { hair: [0, 1.5, 0], nose: [0, 26, 26], beard: [0, 0.1599999964237213, 1.5499999523162842] },
        { hair: [0, -2, 0], nose: [0, 22.5, 26], beard: [0, -1.4900000095367432, 0.05000000074505806] },
        { hair: [0, 1.5, 0], nose: [0, 26, 26], beard: [0, 0.20999999344348907, 0.5400000214576721] },
        { hair: [0, 3, 0], nose: [0, 27.5, 26], beard: [0, -5.409999847412109, 2.4800000190734863] }
    ],
    bodyFrames: [
        {
            pose: "S",
            headScale: 0.75,
            headTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.000015515081, 7.8746862, -0.123135, 1]
        },
        {
            pose: "M",
            headScale: 0.800000011920929,
            headTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.000017284008, 10.091051, 0, 1]
        },
        {
            pose: "L",
            headScale: 0.8999999761581421,
            headTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.000021319327, 12.540863, 0, 1]
        }
    ]
};

const signed = (table, index) => DATA[DILLON_TABLES.scoreOffsets[table] + index];

function checkedFeatures(mii) {
    for (const [field, maximum] of Object.entries(DILLON_TABLES.limits)) {
        if (!Number.isInteger(mii[field]) || mii[field] < 0 || mii[field] > maximum) {
            throw new RangeError(`Invalid Dillon Mii ${field}: ${mii[field]} (expected integer 0-${maximum}).`);
        }
    }
    return mii;
}

function facialFeatures(input) {
    const mii = input?.fields ?? input;
    if (!mii || typeof mii !== "object" || Array.isArray(mii) || ArrayBuffer.isView(mii)) {
        throw new TypeError("Expected a decoded Mii object or Mii instance.");
    }
    if (mii.ltd?.charInfo) {
        const source = mii.ltd.charInfo;
        function patch(group, field, value) {
            const entry = reviewedLtdCharInfoBackport.tables[group][field][value];
            if (!entry) throw new RangeError(`LTD ${field} selector ${value} has no reviewed classic Mii mapping.`);
            return entry.patch;
        }
        function clamp(value, maximum) {
            if (!Number.isFinite(value)) throw new RangeError("Missing or invalid LTD facial geometry.");
            return Math.min(maximum, Math.max(0, Math.trunc(value)));
        }
        const bangs = patch("hair", "hairFrontType", source.hairFrontType);
        const eyes = patch("eyes", "eyeType", source.eyeType);
        const nose = patch("nose", "noseType", source.noseType);
        const mouth = patch("mouth", "mouthType", source.mouthType);
        // Match the reviewed LTD -> CHARINFO projection, including Nothing patches.
        return checkedFeatures({
            faceType: patch("face", "facelineType", source.facelineType)["face.type"],
            hairType: (source.hairFrontType !== 0 && Object.hasOwn(bangs, "hair.type")
                ? bangs : patch("hair", "hairType", source.hairType))["hair.type"],
            eyeType: eyes["eyes.type"],
            eyeAspect: eyes["eyes.squash"] ?? clamp(source.eyeAspect, 6),
            eyeRotate: clamp(source.eyeRotate, 7),
            eyeX: eyes["eyes.distanceApart"] ?? clamp(source.eyeX, 12),
            eyeY: eyes["eyes.yPosition"] ?? clamp(source.eyeY, 18),
            noseType: nose["nose.type"],
            noseScale: nose["nose.size"] ?? clamp(source.noseScale, 8),
            noseY: nose["nose.yPosition"] ?? clamp(source.noseY, 18),
            mouthType: mouth["mouth.type"],
            mouthScale: mouth["mouth.size"] ?? clamp(source.mouthScale, 8)
        });
    }
    const female = Number(mii.general?.gender) === 1;
    // Match encodeMii's established defaults for older formats or partial Miis.
    return checkedFeatures({
        faceType: mii.face?.type ?? 0,
        hairType: mii.hair?.type ?? (female ? 12 : 33),
        eyeType: mii.eyes?.type ?? (female ? 4 : 2),
        eyeAspect: mii.eyes?.squash ?? 3,
        eyeRotate: mii.eyes?.rotation ?? (female ? 3 : 4),
        eyeX: mii.eyes?.distanceApart ?? 2,
        eyeY: mii.eyes?.yPosition ?? 12,
        noseType: mii.nose?.type ?? 1,
        noseScale: mii.nose?.size ?? 4,
        noseY: mii.nose?.yPosition ?? 9,
        mouthType: mii.mouth?.type ?? 23,
        mouthScale: mii.mouth?.size ?? 4
    });
}

/**
 * Return the classic facial fields scored by the game. LTD uses the reviewed
 * visual projection; classic and Switch selectors share the 3DS ranges.
 */
export function getDillonMiiFacialFeatures(input) {
    const mii = facialFeatures(input);
    return {
        face: { type: mii.faceType }, hair: { type: mii.hairType },
        eyes: { type: mii.eyeType, squash: mii.eyeAspect, rotation: mii.eyeRotate,
            distanceApart: mii.eyeX, yPosition: mii.eyeY },
        nose: { type: mii.noseType, size: mii.noseScale, yPosition: mii.noseY },
        mouth: { type: mii.mouthType, size: mii.mouthScale }
    };
}

// Original triangle rasterizer and callbacks: ARM 0x3108cc, 0x311274,
// 0x185cb4 and 0x185d28. Bresenham's inclusive endpoints affect the score.
function drawTriangle(pixels, eyeX, eyeY, noseY) {
    const x0 = Math.max(0, Math.min(13, eyeX));
    const y0 = Math.max(0, Math.min(29, eyeY));
    const y1 = Math.max(0, Math.min(29, noseY + 10));
    let x = x0, y = y0;
    const dx = x0, dy = Math.abs(y1 - y0), sy = y1 >= y0 ? 1 : -1;
    function plot() {
        if (y1 - y0 < x0) {
            for (let yy = y0; yy <= y; yy++) pixels[13 * yy + x]++;
        } else {
            for (let xx = 0; xx <= x; xx++) pixels[13 * y + xx]++;
        }
    }
    if (dx > dy) {
        let err = -dx;
        for (let n = 0; n <= dx; n++) {
            plot();
            err += 2 * dy;
            x--;
            if (err >= 0) { err -= 2 * dx; y += sy; }
        }
    } else {
        let err = -dy;
        for (let n = 0; n <= dy; n++) {
            plot();
            err += 2 * dx;
            y += sy;
            if (err >= 0) { x--; err -= 2 * dy; }
        }
    }
}

// ARM 0x24b4a8: all seven criteria enabled by constructor 0x108f14.
/**
 * Rank all ten animals using the seven original criteria and native tie order.
 * @returns {{ id: number, type: string, score: number }[]} Higher scores first.
 */
export function rankDillonAmiimals(input) {
    const mii = facialFeatures(input);
    const scores = [{ id: 0, type: null, score: 0 }];
    for (let id = 1; id <= 10; id++) {
        const features = [];
        // ARM 0x185a5c: overlap / union of eye-to-nose triangles on a 13x29 grid.
        if (mii.eyeY > mii.noseY + 10) {
            features.push(-4);
        } else {
            const offset = id * 4;
            const pixels = new Uint8Array(377);
            drawTriangle(pixels, mii.eyeX, mii.eyeY, mii.noseY);
            drawTriangle(pixels, DATA[offset + 1], DATA[offset + 2], DATA[offset + 3]);
            let union = 0, overlap = 0;
            for (const pixel of pixels) {
                if (pixel !== 0) union++;
                if (pixel > 1) overlap++;
            }
            features.push(union ? Math.floor(Math.fround(Math.fround(overlap / union) * DATA[offset])) : 0);
        }
        features.push(signed(0, 12 * id + mii.faceType), signed(1, 132 * id + mii.hairType));
        const eye = 3 * mii.eyeType;
        let eyeVariant = 0;
        if (mii.eyeAspect >= signed(3, eye + 1) && mii.eyeAspect <= signed(3, eye + 2)) {
            const rotation = signed(3, eye);
            if (mii.eyeRotate > rotation) eyeVariant = 1;
            else if (mii.eyeRotate < rotation) eyeVariant = 2;
        }
        features.push(signed(2, 180 * id + eye + eyeVariant));
        const nose = 3 * mii.noseType;
        const standard = signed(5, nose + 1);
        let noseScore = 0;
        // Preserve the game's actual stride of 18, despite the larger table.
        if (mii.noseScale === standard) noseScore = signed(4, 18 * id + nose + 1);
        else if (mii.noseScale > standard && mii.noseScale <= signed(5, nose)) noseScore = signed(4, 18 * id + nose);
        else if (mii.noseScale < standard && mii.noseScale >= signed(5, nose + 2)) noseScore = signed(4, 18 * id + nose + 2);
        features.push(noseScore);
        features.push(mii.mouthScale >= signed(7, 2 * mii.mouthType + 1) && mii.mouthScale <= signed(7, 2 * mii.mouthType)
            ? signed(6, 36 * id + mii.mouthType) : 0);
        features.push(mii.eyeY >= signed(9, mii.eyeType) ? signed(8, 60 * id + mii.eyeType) : 0);
        scores.push({ id, type: DILLON_AMIIMAL_TYPES[id], score: features.reduce((a, b) => a + b, 0) });
    }
    // Descending selection sort, strict greater-than, with swaps. A stable
    // Array.sort changes tied animals and can change the four menu choices.
    for (let i = 1; i < 10; i++) {
        let max = i;
        for (let j = i + 1; j <= 10; j++) if (scores[j].score > scores[max].score) max = j;
        if (max !== i) [scores[i], scores[max]] = [scores[max], scores[i]];
    }
    return scores.slice(1);
}

// op_chara_make VPLS helper 0x22d0. First from each group, plus the first
// duplicate group encountered; preserve encounter order in the four slots.
/** Return the four Amiimal names in their exact in-game menu order. */
export function getDillonAmiimalTypes(input) {
    const seen = new Set(), choices = [];
    let extraUsed = false;
    for (const ranked of rankDillonAmiimals(input)) {
        const group = [-1, 2, 1, 1, 1, 0, 1, 0, 0, 2, 2][ranked.id];
        if (!seen.has(group)) {
            seen.add(group);
            choices.push(ranked.type);
        } else if (!extraUsed) {
            extraUsed = true;
            choices.push(ranked.type);
        }
    }
    return choices;
}

const SPECIES = {
    Bull: {
        code: "Cow", frame: 2, bodyScale: 0.550000011920929,
        hairColor: [56, 30, 25, 255],
        faceColor: [147, 73, 40, 255],
        facePaintColor: [205, 180, 131, 255],
        facePaintTexture: "cow_facePaint",
        facePaintHeightRange: [0.25, 1],
        keepMole: true,
        keepBeard: true,
        noseYRange: [8, 9],
        eyebrowColor: 1
    },
    Fox: {
        code: "Fox", frame: 1, bodyScale: 0.550000011920929,
        hairColor: [183, 109, 22, 255],
        faceColor: [204, 119, 34, 255],
        facePaintColor: [244, 211, 153, 255],
        facePaintTexture: "fox_facePaint",
        facePaintOffsetRange: [-0.25, 0.25],
        noseYRange: [12, 13],
        eyebrowColor: 1
    },
    Wolf: {
        code: "Wol", frame: 1, bodyScale: 0.550000011920929,
        hairColor: [98, 92, 77, 255],
        faceColor: [168, 168, 176, 255],
        facePaintColor: [225, 210, 193, 255],
        noseYRange: [9, 12],
        eyebrowColor: 0
    },
    Sheep: {
        code: "She", frame: 1, bodyScale: 0.550000011920929,
        hairColor: [201, 193, 174, 255],
        faceColor: [203, 192, 159, 255],
        facePaintColor: [255, 255, 255, 255],
        hideHair: true,
        keepMole: true,
        keepBeard: true,
        noseYRange: [6, 10],
        eyebrowColor: 4
    },
    Duck: {
        code: "Duc", frame: 0, bodyScale: 0.550000011920929,
        hairColor: [213, 185, 135, 255],
        faceColor: [246, 217, 173, 255],
        facePaintColor: [255, 255, 255, 255],
        noseYRange: [10, 12],
        eyebrowColor: 5
    },
    Cat: {
        code: "Cat", frame: 1, bodyScale: 0.550000011920929,
        hairColor: [125, 123, 122, 255],
        faceColor: [93, 87, 76, 255],
        facePaintColor: [255, 255, 255, 255],
        facePaintTexture: "cat_facePaint",
        facePaintOffsetRange: [-0.25, 0.25],
        keepMole: true,
        noseYRange: [9, 13],
        eyebrowColor: 5
    },
    Rabbit: {
        code: "Bun", frame: 0, bodyScale: 0.550000011920929,
        hairColor: [212, 165, 83, 255],
        faceColor: [179, 156, 101, 255],
        facePaintColor: [218, 192, 132, 255],
        noseSizeRange: [4, 5],
        noseYRange: [11, 11],
        eyebrowColor: 6
    },
    Mouse: {
        code: "Mou", frame: 0, bodyScale: 0.550000011920929,
        hairColor: [106, 86, 25, 255],
        faceColor: [177, 147, 97, 255],
        facePaintColor: [252, 232, 182, 255],
        noseSizeRange: [4, 5],
        noseYRange: [9, 12],
        eyebrowColor: 5
    },
    Bear: {
        code: "Bea", frame: 2, bodyScale: 0.550000011920929,
        hairColor: [105, 77, 50, 255],
        faceColor: [178, 127, 76, 255],
        facePaintColor: [178, 127, 76, 255],
        keepBeard: true,
        noseYRange: [8, 11],
        eyebrowColor: 1
    },
    Tiger: {
        code: "Tig", frame: 2, bodyScale: 0.6000000238418579,
        hairColor: [192, 161, 71, 255],
        faceColor: [191, 120, 28, 255],
        facePaintColor: [86, 52, 12, 255],
        facePaintTexture: "tiger_facePaint",
        keepMole: true,
        noseYRange: [10, 15],
        eyebrowColor: 1
    }
};
// Native appearance setup: ARM 0x363e68, 0x3635d0 and 0x362c3c.
const f32 = Math.fround;
const UNIT_SCALE = f32(0.1);

// VFP helper 0x265608: bounded linear interpolation, retaining float32 steps.
function interpolate(lower, upper, extent, position) {
    if (position <= 0) return lower;
    if (position >= extent) return upper;
    return f32(f32(f32(f32(upper - lower) * position) / extent) + lower);
}

/**
 * Copy native CFL face-shape anchors in original model units. Nose is the
 * reference position for Y=8. The beard anchor also positions animal cheeks
 * and exists even when the Mii has no beard geometry.
 */
export function getDillonFaceAnchors(input) {
    const anchors = DILLON_TABLES.faceAnchors[getDillonMiiFacialFeatures(input).face.type];
    return { hair: [...anchors.hair], nose: [...anchors.nose], beard: [...anchors.beard] };
}

/**
 * Return native anchors, palettes, placement and visibility rules. Positions
 * use CFL model units; unitScale converts them to Dillon units.
 */
export function getDillonAppearanceParameters(animal, originalMii = {}) {
    const id = typeof animal === "number" ? animal
        : DILLON_AMIIMAL_TYPES.findIndex(type => type?.toLowerCase() === String(animal).toLowerCase());
    if (!Number.isInteger(id) || id < 1 || id > 10) {
        throw new RangeError(`Unknown Dillon Amiimal type: ${animal}.`);
    }
    const type = DILLON_AMIIMAL_TYPES[id];
    const row = SPECIES[type];
    const mii = getDillonMiiFacialFeatures(originalMii);
    const noseY = Math.max(row.noseYRange[0], Math.min(row.noseYRange[1], mii.nose.yPosition));
    const noseSizeRange = row.noseSizeRange || [3, 4];
    return {
        type,
        unitScale: UNIT_SCALE,
        anchors: getDillonFaceAnchors(mii),
        hairColor: [...row.hairColor],
        faceColor: [...row.faceColor],
        facePaintColor: [...row.facePaintColor],
        nose: {
            offset: [0, f32((noseY - 8) * f32(-1.5)), 0],
            scale: f32(interpolate(
                f32(f32(f32(0.175) * noseSizeRange[0]) + f32(0.4)),
                f32(f32(f32(0.175) * noseSizeRange[1]) + f32(0.4)),
                f32(8), mii.nose.size
            ) * UNIT_SCALE),
            yPosition: noseY
        },
        facePaint: {
            textureName: row.facePaintTexture || null,
            offsetYFraction: row.facePaintOffsetRange
                ? interpolate(...row.facePaintOffsetRange, f32(18), noseY) : 0,
            // Native drawing uses y0/y1 corners: this is the bottom endpoint,
            // not an extent. Rectangle height is (heightFraction-offsetYFraction).
            heightFraction: row.facePaintHeightRange
                ? interpolate(...row.facePaintHeightRange, f32(18), noseY) : 1
        },
        hide: {
            hair: Boolean(row.hideHair),
            mole: !row.keepMole,
            beard: !row.keepBeard
        },
        eyebrowColor: row.eyebrowColor
    };
}

/**
 * Clone a canonical Mii and apply the game's packed-field changes.
 * Project LTD to classic fields first.
 */
export function applyDillonAppearance(input, animal) {
    const source = input?.fields ?? input;
    if (source?.ltd) throw new TypeError("Project LTD to a canonical classic Mii before applying Dillon appearance.");
    const params = getDillonAppearanceParameters(animal, source);
    const mii = structuredClone(source);
    mii.nose ??= {};
    mii.nose.yPosition = params.nose.yPosition;
    mii.mouth ??= {};
    Object.assign(mii.mouth, { type: 2, size: 0, squash: 0, yPosition: params.nose.yPosition });
    if (params.hide.hair) {
        mii.hair ??= {};
        mii.hair.type = 30;
    }
    if (params.hide.mole) {
        mii.mole ??= {};
        mii.mole.on = false;
    }
    mii.beard ??= {};
    if (params.hide.beard) mii.beard.type = 0;
    mii.beard.mustache ??= {};
    mii.beard.mustache.type = 0;
    if (params.eyebrowColor >= 0) {
        mii.eyebrows ??= {};
        // MiiJS canonical colors use common-color 8 for Ver3 black (selector 0).
        mii.eyebrows.color = params.eyebrowColor === 0 ? 8 : params.eyebrowColor;
    }
    return mii;
}

export function getDillonPoseTransforms(model, pose, THREE) {
    const bind = model.bones.map(bone => new THREE.Matrix4().fromArray(bone.worldTransform));
    const world = [];
    const visit = index => {
        if (world[index]) return world[index];
        const bone = model.bones[index];
        const animation = pose?.bones?.[bone.name];
        const local = animation
            ? new THREE.Matrix4().fromArray(animation.localMatrix || animation)
            : bone.parent < 0 ? bind[index].clone()
                : bind[bone.parent].clone().invert().multiply(bind[index]);
        return world[index] = bone.parent < 0 ? local : visit(bone.parent).clone().multiply(local);
    };
    model.bones.forEach((_, index) => visit(index));
    return world;
}

export function createDillonGeometry(mesh, submesh, model, THREE, posedWorld) {
    const world = posedWorld || model.bones.map(bone => new THREE.Matrix4().fromArray(bone.worldTransform));
    const smooth = submesh.skinning === "Smooth";
    const matrices = submesh.boneTable.map(index => smooth
        ? world[index].clone().multiply(new THREE.Matrix4().fromArray(model.bones[index].inverseTransform))
        : world[index]);
    const normals = matrices.map(matrix => new THREE.Matrix3().getNormalMatrix(matrix));
    const remap = new Map(), positions = [], normalValues = [], uv = [];
    const point = new THREE.Vector3(), normal = new THREE.Vector3();
    const originalPoint = new THREE.Vector3(), originalNormal = new THREE.Vector3();
    const transformed = new THREE.Vector3();
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(submesh.indices.map(vertex => {
        if (remap.has(vertex)) return remap.get(vertex);
        const index = remap.size;
        remap.set(vertex, index);
        originalPoint.fromArray(mesh.position, vertex * 3);
        originalNormal.fromArray(mesh.normal, vertex * 3);
        point.copy(originalPoint);
        normal.copy(originalNormal);
        if (submesh.skinning === "Rigid" && matrices.length) {
            const bone = mesh.boneIndices[vertex * 4] || 0;
            point.applyMatrix4(matrices[bone]);
            normal.applyMatrix3(normals[bone]).normalize();
        } else if (smooth && posedWorld && matrices.length) {
            point.set(0, 0, 0);
            normal.set(0, 0, 0);
            let total = 0;
            for (let influence = 0; influence < 4; influence++) {
                const offset = vertex * 4 + influence;
                const weight = mesh.boneWeights[offset];
                if (!weight) continue;
                const bone = mesh.boneIndices[offset];
                point.addScaledVector(transformed.copy(originalPoint).applyMatrix4(matrices[bone]), weight);
                normal.addScaledVector(transformed.copy(originalNormal).applyMatrix3(normals[bone]), weight);
                total += weight;
            }
            if (!total) {
                point.copy(originalPoint);
                normal.copy(originalNormal);
            } else {
                normal.normalize();
            }
        }
        positions.push(point.x, point.y, point.z);
        if (mesh.normal.length) normalValues.push(normal.x, normal.y, normal.z);
        if (mesh.uv.length) uv.push(mesh.uv[vertex * 2], mesh.uv[vertex * 2 + 1]);
        return index;
    }));
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    if (normalValues.length) geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normalValues, 3));
    if (uv.length) geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    if (!normalValues.length) geometry.computeVertexNormals();
    // Compact indexed vertices so camera bounds do not include unused bind-pose arms.
    geometry.computeBoundingBox();
    return geometry;
}

const MODEL_CACHE = new Map();

export function resolveDillonAnimal(value, mii) {
    if (value === undefined || value === null || value === "") return getDillonAmiimalTypes(mii)[0];
    const animal = typeof value === "number"
        ? DILLON_AMIIMAL_TYPES[value]
        : DILLON_AMIIMAL_TYPES.find(type => type && type.toLowerCase() === String(value).trim().toLowerCase());
    if (!animal) throw new RangeError("Dillon animal must be Bear, Bull, Cat, Duck, Fox, Mouse, Rabbit, Sheep, Tiger or Wolf.");
    return animal;
}

function assetRoot(options) {
    if (isNode) {
        if (!options.dillonAssetsPath) throw new Error("Specify dillonAssetsPath when rendering a Dillon Mii in Node.js.");
        return `${options.dillonAssetsPath.replace(/[\\/]$/, "")}/`;
    }
    if (!options.dillonAssetsUrl) throw new Error("Specify dillonAssetsUrl when rendering a Dillon Mii in a browser.");
    const url = new URL(options.dillonAssetsUrl, globalThis.document?.baseURI);
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    return url;
}

function assetPath(root, relative) {
    return root instanceof URL ? new URL(relative, root) : `${root}${relative}`;
}

async function loadAsset(root, relative) {
    const path = assetPath(root, relative);
    if (isNode) return fs.promises.readFile(path);
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Dillon asset unavailable: ${relative} (${response.status}).`);
    return new Uint8Array(await response.arrayBuffer());
}

async function loadJson(root, relative) {
    const key = String(root) + relative;
    if (!MODEL_CACHE.has(key)) {
        const promise = loadAsset(root, relative).then(data =>
            JSON.parse(new TextDecoder().decode(data)));
        MODEL_CACHE.set(key, promise);
        promise.catch(() => MODEL_CACHE.delete(key));
    }
    return MODEL_CACHE.get(key);
}

const loadModel = (root, name) => loadJson(root, `models/${name}.json`);

async function loadTexture(root, source, THREE) {
    const relative = `textures/${source.url.split("/").pop()}`;
    let texture;
    if (isNode) {
        const png = (await import("pngjs")).PNG.sync.read(await loadAsset(root, relative));
        texture = new THREE.DataTexture(new Uint8Array(png.data), png.width, png.height);
        texture.flipY = true;
    } else {
        texture = await new THREE.TextureLoader().loadAsync(String(assetPath(root, relative)));
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

function addNativeModel(group, model, THREE, materialFactory, posedWorld) {
    const result = new THREE.Group();
    result.name = model.name;
    for (const mesh of model.meshes) {
        if (model.meshNodesVisibility[mesh.node] === false) continue;
        for (const submesh of mesh.submeshes) {
            const object = new THREE.Mesh(
                createDillonGeometry(mesh, submesh, model, THREE, posedWorld),
                materialFactory(model.materials[mesh.material], mesh)
            );
            object.frustumCulled = false;
            result.add(object);
        }
    }
    group.add(result);
    return result;
}

/** Insert native animal paint beneath the Mii's original makeup/wrinkles/beard. */
export async function initializeDillonTextures(charModel, renderer, Material, THREE, parameters, options = {}) {
    const root = assetRoot(options);
    const source = (await loadModel(root, `kmFace${SPECIES[parameters.type].code}`)).textures
        .find(texture => texture.name === parameters.facePaint.textureName);
    if (!source) {
        charModel.initTextures(renderer, Material);
        return null;
    }
    const paintTexture = await loadTexture(root, source, THREE);
    const top = parameters.facePaint.offsetYFraction;
    const bottom = parameters.facePaint.heightFraction;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2 * (bottom - top)),
        new THREE.MeshBasicMaterial({ map: paintTexture,
            color: new THREE.Color().setRGB(...parameters.facePaintColor.slice(0, 3).map(c => c / 255), THREE.SRGBColorSpace),
            transparent: true,
            opacity: parameters.facePaintColor[3] / 255, depthTest: false, depthWrite: false }));
    plane.position.y = 1 - top - bottom;
    plane.renderOrder = -10;
    // All current game paint masks are A4 (white RGB and native alpha).
    // Keep the native format when extending this to RGB paint textures.
    let inserted = false;
    const render = renderer.render;
    renderer.render = function(scene, camera) {
        if (!inserted && scene.background?.isColor) {
            inserted = true;
            scene.background = charModel.facelineColor;
            scene.traverse(mesh => {
                if (!mesh.isMesh) return;
                mesh.material.transparent = true;
                mesh.material.depthTest = false;
                mesh.material.depthWrite = false;
            });
            scene.add(plane);
        }
        return render.call(this, scene, camera);
    };
    try {
        charModel.initTextures(renderer, Material);
    } catch (error) {
        plane.geometry.dispose();
        plane.material.dispose();
        paintTexture.dispose();
        throw error;
    } finally {
        renderer.render = render;
    }
    if (!inserted) {
        // FFL omits the faceline target when there are no original details.
        // Animal paint still requires a texture in that case.
        const scene = new THREE.Scene();
        scene.background = charModel.facelineColor;
        scene.add(plane);
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        try {
            return (await import("ffl.js")).createAndRenderToTarget(scene, camera, renderer, 256, 512,
                { depthBuffer: false, stencilBuffer: false, wrapS: THREE.MirroredRepeatWrapping,
                    wrapT: THREE.MirroredRepeatWrapping });
        } finally {
            plane.geometry.dispose();
            plane.material.dispose();
            paintTexture.dispose();
        }
    }
    return null;
}

export async function createDillonModel(mii, charModel, THREE, options = {}) {
    const animal = resolveDillonAnimal(options.animal, mii);
    const parameters = getDillonAppearanceParameters(animal, options.originalMii || mii);
    const root = assetRoot(options);
    const bodyRow = options.fullBody ? SPECIES[animal] : null;
    const assets = await Promise.all([
        loadModel(root, `kmFace${SPECIES[animal].code}`), loadModel(root, "MiiData"),
        loadModel(root, `MiiHead${String(mii.hair.type).padStart(3, "0")}`),
        bodyRow ? loadModel(root, `kmBody${bodyRow.code}Fr`) : null
    ]);
    const faceAsset = assets[0], bodyAsset = assets[3];
    const group = new THREE.Group(), head = new THREE.Group();
    head.name = "DillonHead";
    group.add(head);
    const textures = new Map();
    await Promise.all(faceAsset.textures.map(async source => textures.set(source.name, await loadTexture(root, source, THREE))));
    if (bodyAsset) await Promise.all(bodyAsset.textures.map(async source => textures.set(source.name, await loadTexture(root, source, THREE))));
    const hair = new THREE.Color().setRGB(...parameters.hairColor.slice(0, 3).map(channel => channel / 255), THREE.SRGBColorSpace);
    const faceType = String(mii.face.type).padStart(2, "0");
    const faceline = options.facelineTarget || charModel.getFaceline();
    // Game BCH uses bottom-origin UVs; FFL's generated targets use top-origin UVs.
    for (const target of [faceline, charModel.getMask()]) if (target) {
        target.texture.repeat.y = -1;
        target.texture.offset.y = 1;
        target.texture.updateMatrix();
    }
    const faceMaterial = () => new THREE.MeshPhongMaterial({ color: faceline ? 0xffffff : charModel.facelineColor.clone(),
        map: faceline?.texture || null, shininess: 20 });
    for (const model of assets[1].models) {
        if (model.name === `Faceline${faceType}`) addNativeModel(head, model, THREE, faceMaterial);
        if (model.name === `Mask${faceType}`) {
            addNativeModel(head, model, THREE, () => new THREE.MeshBasicMaterial({
                map: charModel.getMask()?.texture || null,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })).traverse(mesh => { mesh.renderOrder = 7; });
        }
    }
    for (const model of assets[2].models) {
        if (model.name.startsWith("Cap")) continue; // FFL supplies the colored cap texture below.
        addNativeModel(head, model, THREE, () => model.name.startsWith("Hair")
            ? new THREE.MeshPhongMaterial({ color: hair, shininess: 30, side: THREE.DoubleSide }) : faceMaterial())
            .position.set(...parameters.anchors.hair);
    }
    if (mii.hair.flipped) for (const child of head.children) if (/Hair|Forehead/.test(child.name)) child.scale.x = -1;
    const nativeMaterial = material => new THREE.MeshPhongMaterial({ color: 0xffffff,
        map: textures.get(material.textures[0]) || null, shininess: 25,
        side: THREE.DoubleSide, transparent: false });
    for (const model of faceAsset.models) {
        const part = addNativeModel(head, model, THREE, nativeMaterial);
        if (model.name.endsWith("Nose")) {
            part.position.set(...parameters.anchors.nose).add(new THREE.Vector3(...parameters.nose.offset));
            part.scale.setScalar(parameters.nose.scale / parameters.unitScale);
        } else if (model.name.endsWith("Ear")) {
            part.position.set(...parameters.anchors.hair);
        } else if (model.name.endsWith("Cheek")) {
            part.position.set(...parameters.anchors.beard);
        }
    }
    // Preserve FFL's Mii-dependent cap/glasses/beard geometry and placement.
    for (const mesh of charModel.meshes.children) {
        const type = mesh.geometry.userData.modulateType;
        if (type === 8 || type === 5 || type === 1 && !parameters.hide.beard) {
            const part = mesh.clone();
            part.geometry = mesh.geometry.clone();
            const source = mesh.material;
            part.material = type === 1 ? new THREE.MeshPhongMaterial({ color: hair, side: THREE.DoubleSide })
                : source.modulateMode === undefined ? source.clone() : new source.constructor({ map: source.map, color: source.color?.clone(),
                    colorG: source.colorG?.clone(), colorB: source.colorB?.clone(),
                    modulateMode: source.modulateMode, modulateType: source.modulateType,
                    lightEnable: source.lightEnable, side: source.side,
                    transparent: source.transparent, opacity: source.opacity, depthWrite: source.depthWrite });
            head.add(part);
        }
    }
    if (bodyAsset) {
        const body = new THREE.Group();
        body.name = "DillonBody";
        const idle = options.bodyPose === "bind" ? null : await loadJson(root, "poses/idle.json");
        const bodyFrame = DILLON_TABLES.bodyFrames[bodyRow.frame];
        let headTransform = new THREE.Matrix4().fromArray(bodyFrame.headTransform);
        for (const model of bodyAsset.models) {
            const pose = idle?.poses?.[bodyFrame.pose];
            if (idle && !pose) throw new Error(`Dillon standing pose unavailable for ${animal}.`);
            const posedWorld = pose ? getDillonPoseTransforms(model, pose, THREE) : undefined;
            addNativeModel(body, model, THREE, nativeMaterial, posedWorld);
            const headBone = model.bones.findIndex(bone => bone.name === "Head");
            if (posedWorld && headBone >= 0) headTransform = posedWorld[headBone];
        }
        group.add(body);
        head.applyMatrix4(headTransform);
        head.scale.multiplyScalar(parameters.unitScale * bodyFrame.headScale);
        group.scale.setScalar(bodyRow.bodyScale);
    }
    group.userData.animal = animal;
    group.userData.dillonTextures = [...textures.values()];
    return group;
}

export function disposeDillonModel(model) {
    const geometries = new Set(), materials = new Set();
    model.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materials.add(material);
        }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of model.userData.dillonTextures || []) texture.dispose();
}

export const DILLON_FACE_FRAME = Object.freeze({
    span: 469 / 4.45,
    centerX: (21 + 469 / 2 - 256) / 4.45,
    centerY: (464 - 85 - 469 / 2) / 4.45
});

export function getDillonCamera(model, THREE, fullBody = false) {
    model.updateWorldMatrix(true, true);
    let center, span;
    if (fullBody) {
        const bounds = new THREE.Box3();
        model.traverse(object => {
            if (!object.isMesh || /^Mask/.test(object.parent?.name || "")) return;
            bounds.expandByObject(object);
        });
        center = bounds.getCenter(new THREE.Vector3());
        const dimensions = bounds.getSize(new THREE.Vector3());
        span = Math.max(dimensions.x, dimensions.y) * 1.12;
    } else {
        const head = model.getObjectByName("DillonHead");
        if (!head) throw new Error("Dillon model has no head for face framing.");
        center = head.localToWorld(new THREE.Vector3(DILLON_FACE_FRAME.centerX, DILLON_FACE_FRAME.centerY, 0));
        span = DILLON_FACE_FRAME.span * head.getWorldScale(new THREE.Vector3()).y;
    }
    const camera = new THREE.OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0.01, span * 20);
    camera.position.set(center.x, center.y, center.z + span * 5);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    return camera;
}
