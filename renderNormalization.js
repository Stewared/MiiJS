import { backTables } from "./data.js";

const LEGACY_GLASSES_TYPE_MAX = 8;
const MODERN_GLASSES_TYPE_MAX = 19;

/**
 * Convert a Mii glasses type to the legacy range used by the 3DS-era FFL/CFL
 * resources. Switch-era formats add types 9-19, which have MiiJS-supported
 * legacy equivalents in the same table used by MiiJS format backports.
 *
 * @param {number} type glasses type from a decoded Mii
 * @returns {number} glasses type in the range 0-8
 */
export function normalizeGlassesTypeFor3DSRender(type) {
    if (!Number.isInteger(type) || type < 0 || type > MODERN_GLASSES_TYPE_MAX) {
        throw new RangeError(`Unsupported Mii glasses type ${JSON.stringify(type)}; expected 0-19`);
    }
    return type <= LEGACY_GLASSES_TYPE_MAX
        ? type
        : backTables.switch.glassesTypes[type - (LEGACY_GLASSES_TYPE_MAX + 1)];
}
