import { backTables } from "./data.js";

const LEGACY_GLASSES_TYPE_MAX = 8;

/** Map Switch-only glasses types to the legacy FFL range. */
export function normalizeGlassesTypeFor3DSRender(type) {
    if (!Number.isInteger(type) || type < 0 || type > 19) {
        throw new RangeError(`Unsupported Mii glasses type ${JSON.stringify(type)}; expected 0-19`);
    }
    return type <= LEGACY_GLASSES_TYPE_MAX
        ? type
        : backTables.switch.glassesTypes[type - (LEGACY_GLASSES_TYPE_MAX + 1)];
}
