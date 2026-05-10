import { decodeMii } from "./miiProcess.js";
import { ConsoleFormats, backPort, defaultMappings, mappings } from "./formats.js";
import { lookupTables } from "./data.js";

const ignoredInstructionDefaults = ["gender"];//Always return these in the instructions even when they're default

const gridColumn = type => (type.startsWith("SWITCH") ? [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3] : [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]);
const gridRow = type => type.startsWith("SWITCH") ? [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2] : [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
const defaultRowNames = ["first", "second", "third", "fourth"];

function getLoc(table, val) {
    for (let y = 0; y < table.length; y++) {
        for (let x = 0; x < table[y].length; x++) {
            if (table[y][x] === val) {
                return [x, y];
            }
        }
    }
    return [-1, -1];
}
function getFlatGridLoc(table, val, grid = lookupTables.instrGrids.threeBy) {
    const index = table.indexOf(val);
    return index === -1 ? [-1, -1] : getLoc(grid, index);
}
function getNestedValue(obj, path) {
    try {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }
    catch (e) {
        return null;
    }
}

function setNestedValue(obj, key, value) {
    try {
        const keys = key.split('.');
        const lastKey = keys.pop();

        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
                current[key] = {};
            }
            return current[key];
        }, obj);

        target[lastKey] = value;
        return obj;
    }
    catch (e) {
        throw new Error(`${key} was not usable.`);
    }
}
function deleteNestedValue(obj, path) {
    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        if (current == null) return; // parent chain missing
        if (!current.hasOwnProperty(parts[i])) return;
        current = current[parts[i]];
    }

    delete current[parts[parts.length - 1]];
}

function defaultsEqual(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }
    return a === b;
}
function getDefaultFor(key, currentVal) {
    if (defaultMappings.hasOwnProperty(key)) return defaultMappings[key];
    // Fallback defaults to 0/false when undefined in defaultMappings
    if (typeof currentVal === "boolean") return false;
    return 0;
}

// Helper function to format grid position strings from array
const formatGridPos = (arr) => {
    if (!Array.isArray(arr) || arr.some(value => !Number.isFinite(Number(value)) || Number(value) < 0)) {
        return "closest available option";
    }

    if (arr.length === 3 && arr[0] !== undefined) {
        // [page, x, y]
        return `on page ${arr[0] + 1}, ${arr[1] + 1} from the left, ${arr[2] + 1} from the top`;
    } else if (arr.length === 2) {
        return `${arr[0] + 1} from the left, ${arr[1] + 1} from the top`;
    } else if (arr.length === 1) {
        // [y] or [x]
        return `${arr[0] + 1} from the top`;
    }
    return "";
};

// Helper for color positions with expanded menu notation
const formatColorPos = (arr) => {
    const hasExpanded = arr.length === 3 && arr[2] === 1;
    const base = hasExpanded ? formatGridPos([arr[0], arr[1]]) : formatGridPos(arr);
    return hasExpanded ? `${base}, in the expanded colors menu` : base;
};

// Special formatter for face.color and similar that use row encoding
const formatRowPos = (arr, rowNames = defaultRowNames) => {
    if (!Array.isArray(arr) || arr.some(value => typeof value !== "string" && (!Number.isFinite(Number(value)) || Number(value) < 0))) {
        return "closest available option";
    }

    if (arr.length === 2) {
        const rowName = typeof arr[1] === "string" ? arr[1] : rowNames[arr[1]];
        if (!rowName) return formatGridPos(arr);

        return rowName === "first" || rowName === "top"
            ? `${arr[0] + 1} from the left`
            : `${arr[0] + 1} from the left, on the ${rowName} row`;
    }
    return formatGridPos(arr);
};

const faceColorRowNames = type => type === ConsoleFormats.WIIU ? ["top", "middle", "bottom"] : ["first", "second"];

// Helper function to reverse getLoc - finds the index that produces the given [x, y] coordinates
function reverseGetLoc(grid, x, y) {
    for (var i = 0; i < grid.length; i++) {
        var loc = getLoc(grid, i);
        if (loc[0] === x && loc[1] === y) {
            return i;
        }
    }
    return null; // Not found
}

// Helper function to reverse grid lookup for face properties
function reverseGridLookup(colGrid, rowGrid, x, row) {
    for (var i = 0; i < colGrid.length; i++) {
        if (colGrid[i] === x && rowGrid[i] === row) {
            return i;
        }
    }
    return null; // Not found
}

function getAs(mii, type, field) {
    if(mappings.hasOwnProperty(field)){
        field=mappings[field];
    }
    switch (field) {
        // Face
        case "face.color":
            switch (type) {
                case ConsoleFormats.WII:
                    return mii.face.color > 2
                        ? [mii.face.color - 3, 1] // [x, row] where row: 0=first, 1=second
                        : [mii.face.color, 0];
                case ConsoleFormats.DS:
                case ConsoleFormats["3DS"]:
                    return [mii.face.color]; // [y]
                case ConsoleFormats.WIIU:
                    return [
                        [0, 1, 0, 1, 0, 1][mii.face.color],
                        [0, 0, 1, 1, 2, 2][mii.face.color] // 0=top, 1=middle, 2=bottom
                    ];
                case ConsoleFormats.SWITCH:
                case ConsoleFormats.SWITCH2:
                    var fc = lookupTables.switch.faceColors[mii.face.color];
                    return fc > 4
                        ? [fc - 5, 1] // [x, row]
                        : [fc, 0];
            }
        case "face.type":
            return [gridColumn(type)[mii.face.type], gridRow(type)[mii.face.type]]; // [x, row]
        case "face.makeup":
            return [gridColumn(type)[mii.face.makeup], gridRow(type)[mii.face.makeup]]; // [x, row]
        case "face.feature":
            return [gridColumn(type)[mii.face.feature], gridRow(type)[mii.face.feature]]; // [x, row]

        // Hair
        case "hair.type":
            switch (type) {
                case ConsoleFormats.DS:
                case ConsoleFormats.WII:
                    var page = getLoc(lookupTables.pages.hair.wii, mii.hair.type);
                    var gridLoc = getLoc(lookupTables.instrGrids.threeBy, page[0]);
                    return [page[1], gridLoc[0], gridLoc[1]]; // [page, x, y]
                case ConsoleFormats["3DS"]:
                case ConsoleFormats.WIIU:
                    var page = getLoc(lookupTables.pages.hair["3ds"], mii.hair.type);
                    var gridLoc = getLoc(lookupTables.instrGrids.threeBy, page[0]);
                    return [page[1], gridLoc[0], gridLoc[1]]; // [page, x, y]
                case ConsoleFormats.SWITCH:
                case ConsoleFormats.SWITCH2:
                    return [
                        getLoc(lookupTables.grids.hairs, mii.hair.type)[0],
                        getLoc(lookupTables.grids.hairs, mii.hair.type)[1]
                    ]; // [x, y]
            }
        case "hair.color":
            if (type.endsWith("DS")) {
                return [mii.hair.color]; // [y]
            }
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.colors
                : type === "WII" ? lookupTables.instrGrids.fourBy
                    : lookupTables.instrGrids.twoBy;
            var loc = getLoc(grid, mii.hair.color);
            return type.startsWith("SWITCH")
                ? [loc[0], loc[1], 1] // [x, y, expanded] where 1=expanded menu
                : [loc[0], loc[1]]; // [x, y]

        // Eyes
        case "eyes.type":
            if (type.startsWith("SWITCH")) {
                return [
                    getLoc(lookupTables.grids.eyes, mii.eyes.type)[0],
                    getLoc(lookupTables.grids.eyes, mii.eyes.type)[1]
                ]; // [x, y]
            }
            var page = getLoc(lookupTables.pages.eyes, mii.eyes.type);
            var gridLoc = getLoc(lookupTables.instrGrids.threeBy, page[0]);
            return [page[1], gridLoc[0], gridLoc[1]]; // [page, x, y]
        case "eyes.color":
            if (type.endsWith("DS")) {
                return [mii.eyes.color]; // [y]
            }
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.colors
                : type === "WII" ? lookupTables.instrGrids.threeBy
                    : lookupTables.instrGrids.twoBy;
            var loc = getLoc(grid, mii.eyes.color);
            return type.startsWith("SWITCH")
                ? [loc[0], loc[1], 1] // [x, y, expanded]
                : [loc[0], loc[1]]; // [x, y]

        // Eyebrows
        case "eyebrows.type":
            if (type.startsWith("SWITCH")) {
                return [
                    getLoc(lookupTables.grids.eyebrows, mii.eyebrows.type)[0],
                    getLoc(lookupTables.grids.eyebrows, mii.eyebrows.type)[1]
                ]; // [x, y]
            }
            var page = getLoc(lookupTables.pages.eyebrows, mii.eyebrows.type);
            var gridLoc = getLoc(lookupTables.instrGrids.threeBy, page[0]);
            return [page[1], gridLoc[0], gridLoc[1]]; // [page, x, y]
        case "eyebrows.color":
            if (type.endsWith("DS")) {
                return [mii.eyebrows.color]; // [y]
            }
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.colors
                : type === "WII" ? lookupTables.instrGrids.fourBy
                    : lookupTables.instrGrids.twoBy;
            var loc = getLoc(grid, mii.eyebrows.color);
            return type.startsWith("SWITCH")
                ? [loc[0], loc[1], 1] // [x, y, expanded]
                : [loc[0], loc[1]]; // [x, y]

        // Nose
        case "nose.type":
            switch (type) {
                case ConsoleFormats.DS:
                case ConsoleFormats.WII:
                    return getFlatGridLoc(lookupTables.pages.noses[0], mii.nose.type); // [x, y]
                case ConsoleFormats["3DS"]:
                case ConsoleFormats.WIIU:
                    var page = getLoc(lookupTables.pages.noses, mii.nose.type);
                    var gridLoc = getLoc(lookupTables.instrGrids.threeBy, page[0]);
                    return [page[1], gridLoc[0], gridLoc[1]]; // [page, x, y]
                case ConsoleFormats.SWITCH:
                case ConsoleFormats.SWITCH2:
                    return [
                        getLoc(lookupTables.grids.noses, mii.nose.type)[0],
                        getLoc(lookupTables.grids.noses, mii.nose.type)[1]
                    ]; // [x, y]
            }

        // Mouth
        case "mouth.type":
            if (type.startsWith("SWITCH")) {
                return [
                    getLoc(lookupTables.grids.mouths, mii.mouth.type)[0],
                    getLoc(lookupTables.grids.mouths, mii.mouth.type)[1]
                ]; // [x, y]
            }
            var page = getLoc(lookupTables.pages.mouths, mii.mouth.type);
            var gridLoc = getLoc(lookupTables.instrGrids.threeBy, page[0]);
            return [page[1], gridLoc[0], gridLoc[1]]; // [page, x, y]
        case "mouth.color":
            if (type.endsWith(ConsoleFormats.DS) || type === ConsoleFormats.WII) {
                return type === ConsoleFormats.WII ? [mii.mouth.color] : [mii.mouth.color]; // [x] or [y]
            }
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.colors : lookupTables.instrGrids.twoBy;
            var loc = getLoc(grid, mii.mouth.color);
            return type.startsWith("SWITCH")
                ? [loc[0], loc[1], 1] // [x, y, expanded]
                : [loc[0], loc[1]]; // [x, y]

        // Beard
        case "beard.mustache.type":
            var loc = getLoc(type.startsWith("SWITCH") ? lookupTables.instrGrids.threeBy : lookupTables.instrGrids.twoBy, mii.beard.mustache.type);
            return [loc[0], loc[1]]; // [x, y]
        case "beard.type":
            var loc = getLoc(type.startsWith("SWITCH") ? lookupTables.instrGrids.threeBy : lookupTables.instrGrids.twoBy, mii.beard.type);
            return [loc[0], loc[1]]; // [x, y]
        case "beard.color":
            if (type.endsWith("DS")) {
                return [mii.beard.color]; // [y]
            }
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.colors
                : type === "WII" ? lookupTables.instrGrids.fourBy
                    : lookupTables.instrGrids.twoBy;
            var loc = getLoc(grid, mii.beard.color);
            return type.startsWith("SWITCH")
                ? [loc[0], loc[1], 1] // [x, y, expanded]
                : [loc[0], loc[1]]; // [x, y]

        // Glasses
        case "glasses.type":
            var loc = getLoc(type.startsWith("SWITCH") ? lookupTables.grids.glasses : lookupTables.instrGrids.threeBy, mii.glasses.type);
            return [loc[0], loc[1]]; // [x, y]
        case "glasses.color":
            if (type.endsWith("DS")) {
                return [mii.glasses.color]; // [y]
            }
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.colors
                : type === "WII" ? lookupTables.instrGrids.threeBy
                    : lookupTables.instrGrids.twoBy;
            var loc = getLoc(grid, mii.glasses.color);
            return type.startsWith("SWITCH")
                ? [loc[0], loc[1], 1] // [x, y, expanded]
                : [loc[0], loc[1]]; // [x, y]
    }
    return null;
}
function setAs(mii, type, field, value) {
    if(mappings.hasOwnProperty(field)){
        field=mappings[field];
    }
    
    switch (field) {
        // Face
        case "face.color":
            switch (type) {
                case ConsoleFormats.WII:
                    // value = [x, row] where row: 0=first, 1=second
                    mii.face.color = value[1] === 1 ? value[0] + 3 : value[0];
                    break;
                case ConsoleFormats.DS:
                case ConsoleFormats["3DS"]:
                    // value = [y]
                    mii.face.color = value[0];
                    break;
                case ConsoleFormats.WIIU:
                    // value = [x, y] where y: 0=top, 1=middle, 2=bottom
                    // Reverse mapping: [0,0]->0, [1,0]->1, [0,1]->2, [1,1]->3, [0,2]->4, [1,2]->5
                    mii.face.color = value[1] * 2 + value[0];
                    break;
                case ConsoleFormats.SWITCH:
                case ConsoleFormats.SWITCH2:
                    // value = [x, row]
                    var fc = value[1] === 1 ? value[0] + 5 : value[0];
                    // Reverse lookup in switch.faceColors
                    mii.face.color = lookupTables.switch.faceColors.indexOf(fc);
                    break;
            }
            break;
            
        case "face.type":
            // value = [x, row]
            mii.face.type = reverseGridLookup(gridColumn(type), gridRow(type), value[0], value[1]);
            break;
            
        case "face.makeup":
            // value = [x, row]
            mii.face.makeup = reverseGridLookup(gridColumn(type), gridRow(type), value[0], value[1]);
            break;
            
        case "face.feature":
            // value = [x, row]
            mii.face.feature = reverseGridLookup(gridColumn(type), gridRow(type), value[0], value[1]);
            break;

        // Hair
        case "hair.type":
            switch (type) {
                case ConsoleFormats.DS:
                case ConsoleFormats.WII:
                    // value = [page, x, y]
                    var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[1], value[2]);
                    mii.hair.type = reverseGetLoc(lookupTables.pages.hair.wii, gridIndex, value[0]);
                    break;
                case ConsoleFormats["3DS"]:
                case ConsoleFormats.WIIU:
                    // value = [page, x, y]
                    var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[1], value[2]);
                    mii.hair.type = reverseGetLoc(lookupTables.pages.hair["3ds"], gridIndex, value[0]);
                    break;
                case ConsoleFormats.SWITCH:
                case ConsoleFormats.SWITCH2:
                    // value = [x, y]
                    mii.hair.type = reverseGetLoc(lookupTables.grids.hairs, value[0], value[1]);
                    break;
            }
            break;
            
        case "hair.color":
            if (type.endsWith("DS")) {
                // value = [y]
                mii.hair.color = value[0];
            } else if (type.startsWith("SWITCH")) {
                // value = [x, y, expanded]
                mii.hair.color = reverseGetLoc(lookupTables.grids.colors, value[0], value[1]);
            } else {
                // value = [x, y]
                var grid = type === "WII" ? lookupTables.instrGrids.fourBy : lookupTables.instrGrids.twoBy;
                mii.hair.color = reverseGetLoc(grid, value[0], value[1]);
            }
            break;

        // Eyes
        case "eyes.type":
            if (type.startsWith("SWITCH")) {
                // value = [x, y]
                mii.eyes.type = reverseGetLoc(lookupTables.grids.eyes, value[0], value[1]);
            } else {
                // value = [page, x, y]
                var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[1], value[2]);
                mii.eyes.type = reverseGetLoc(lookupTables.pages.eyes, gridIndex, value[0]);
            }
            break;
            
        case "eyes.color":
            if (type.endsWith("DS")) {
                // value = [y]
                mii.eyes.color = value[0];
            } else if (type.startsWith("SWITCH")) {
                // value = [x, y, expanded]
                mii.eyes.color = reverseGetLoc(lookupTables.grids.colors, value[0], value[1]);
            } else {
                // value = [x, y]
                var grid = type === "WII" ? lookupTables.instrGrids.threeBy : lookupTables.instrGrids.twoBy;
                mii.eyes.color = reverseGetLoc(grid, value[0], value[1]);
            }
            break;

        // Eyebrows
        case "eyebrows.type":
            if (type.startsWith("SWITCH")) {
                // value = [x, y]
                mii.eyebrows.type = reverseGetLoc(lookupTables.grids.eyebrows, value[0], value[1]);
            } else {
                // value = [page, x, y]
                var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[1], value[2]);
                mii.eyebrows.type = reverseGetLoc(lookupTables.pages.eyebrows, gridIndex, value[0]);
            }
            break;
            
        case "eyebrows.color":
            if (type.endsWith("DS")) {
                // value = [y]
                mii.eyebrows.color = value[0];
            } else if (type.startsWith("SWITCH")) {
                // value = [x, y, expanded]
                mii.eyebrows.color = reverseGetLoc(lookupTables.grids.colors, value[0], value[1]);
            } else {
                // value = [x, y]
                var grid = type === "WII" ? lookupTables.instrGrids.fourBy : lookupTables.instrGrids.twoBy;
                mii.eyebrows.color = reverseGetLoc(grid, value[0], value[1]);
            }
            break;

        // Nose
        case "nose.type":
            switch (type) {
                case ConsoleFormats.DS:
                case ConsoleFormats.WII:
                    // value = [x, y]
                    var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[0], value[1]);
                    mii.nose.type = gridIndex === null ? null : lookupTables.pages.noses[0][gridIndex];
                    break;
                case ConsoleFormats["3DS"]:
                case ConsoleFormats.WIIU:
                    // value = [page, x, y]
                    var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[1], value[2]);
                    mii.nose.type = reverseGetLoc(lookupTables.pages.noses, gridIndex, value[0]);
                    break;
                case ConsoleFormats.SWITCH:
                case ConsoleFormats.SWITCH2:
                    // value = [x, y]
                    mii.nose.type = reverseGetLoc(lookupTables.grids.noses, value[0], value[1]);
                    break;
            }
            break;

        // Mouth
        case "mouth.type":
            if (type.startsWith("SWITCH")) {
                // value = [x, y]
                mii.mouth.type = reverseGetLoc(lookupTables.grids.mouths, value[0], value[1]);
            } else {
                // value = [page, x, y]
                var gridIndex = reverseGetLoc(lookupTables.instrGrids.threeBy, value[1], value[2]);
                mii.mouth.type = reverseGetLoc(lookupTables.pages.mouths, gridIndex, value[0]);
            }
            break;
            
        case "mouth.color":
            if (type.endsWith("DS") || type === "WII") {
                // value = [x] or [y]
                mii.mouth.color = value[0];
            } else if (type.startsWith("SWITCH")) {
                // value = [x, y, expanded]
                mii.mouth.color = reverseGetLoc(lookupTables.grids.colors, value[0], value[1]);
            } else {
                // value = [x, y]
                mii.mouth.color = reverseGetLoc(lookupTables.instrGrids.twoBy, value[0], value[1]);
            }
            break;

        // Beard
        case "beard.mustache.type":
            // value = [x, y]
            var grid = type.startsWith("SWITCH") ? lookupTables.instrGrids.threeBy : lookupTables.instrGrids.twoBy;
            mii.beard.mustache.type = reverseGetLoc(grid, value[0], value[1]);
            break;
            
        case "beard.type":
            // value = [x, y]
            var grid = type.startsWith("SWITCH") ? lookupTables.instrGrids.threeBy : lookupTables.instrGrids.twoBy;
            mii.beard.type = reverseGetLoc(grid, value[0], value[1]);
            break;
            
        case "beard.color":
            if (type.endsWith("DS")) {
                // value = [y]
                mii.beard.color = value[0];
            } else if (type.startsWith("SWITCH")) {
                // value = [x, y, expanded]
                mii.beard.color = reverseGetLoc(lookupTables.grids.colors, value[0], value[1]);
            } else {
                // value = [x, y]
                var grid = type === "WII" ? lookupTables.instrGrids.fourBy : lookupTables.instrGrids.twoBy;
                mii.beard.color = reverseGetLoc(grid, value[0], value[1]);
            }
            break;

        // Glasses
        case "glasses.type":
            // value = [x, y]
            var grid = type.startsWith("SWITCH") ? lookupTables.grids.glasses : lookupTables.instrGrids.threeBy;
            mii.glasses.type = reverseGetLoc(grid, value[0], value[1]);
            break;
            
        case "glasses.color":
            if (type.endsWith("DS")) {
                // value = [y]
                mii.glasses.color = value[0];
            } else if (type.startsWith("SWITCH")) {
                // value = [x, y, expanded]
                mii.glasses.color = reverseGetLoc(lookupTables.grids.colors, value[0], value[1]);
            } else {
                // value = [x, y]
                var grid = type === "WII" ? lookupTables.instrGrids.threeBy : lookupTables.instrGrids.twoBy;
                mii.glasses.color = reverseGetLoc(grid, value[0], value[1]);
            }
            break;
    }
    
    return mii;
}

//Build instructions from the input, and the default.
function buildInstructions(mii, type) {
    return {
        "meta": {
            "name": `Set the name to "${mii.meta.name}".`,
            "creatorName": `The name of this Mii's creator was set to "${mii.meta.creatorName != undefined ? mii.meta.creatorName : ''}".`
        },
        "general": {
            "gender": `Set the ${type === "SWITCH2" ? "style" : "gender"} to "${mii.general.gender == 0 ? "Male" : "Female"}".`,
            "birthMonth": `Set the birth month to ${mii.general.birthMonth != undefined ? mii.general.birthMonth : 0}.`,
            "birthday": `Set the birthday to ${mii.general.birthday != undefined ? mii.general.birthday : 0}.`,
            "favoriteColor": `Set the favorite color to ${lookupTables.favoriteColors[mii.general.favoriteColor].toLowerCase()}.`,
            "height": `Set the height to ${Math.round((mii.general.height / 127) * 100)}%.`,
            "weight": `Set the weight to ${Math.round((mii.general.weight / 127) * 100)}%.`
        },
        "face": {
            "color": `Set the face/skin color to the one ${formatRowPos(getAs(mii, type, "face.color"), faceColorRowNames(type))}.`,
            "type": `Set the face type to the one ${formatRowPos(getAs(mii, type, "face.type"))}.`,
            "makeup": `Set the makeup to the one ${formatRowPos(getAs(mii, type, "face.makeup"))}.`,
            "feature": `Set the facial features/wrinkles to the one ${formatRowPos(getAs(mii, type, "face.feature"))}.`
        },
        "hair": {
            "type": `Set the hair style to the one ${formatGridPos(getAs(mii, type, "hair.type"))}.`,
            "flipped": mii.hair.flipped ? `Press the ${type === "SWITCH2" ? "Y " : ""}button to flip the hair.` : ``,
            "color": `Set the hair color to the one ${formatColorPos(getAs(mii, type, "hair.color"))}.`
        },
        "eyes": {
            "type": `Set the eyes to the one ${formatGridPos(getAs(mii, type, "eyes.type"))}.`,
            "color": `Set the eye color to the one ${formatColorPos(getAs(mii, type, "eyes.color"))}.`,
            "size": `Make the eyes ${mii.eyes.size < 4 ? `${4 - mii.eyes.size} smaller` : `${mii.eyes.size - 4} larger`}.`,
            "squash": `${mii.eyes.squash < 3 ? `S` : `Uns`}quash the eyes ${mii.eyes.squash < 3 ? 3 - mii.eyes.squash : mii.eyes.squash - 3} ${type.startsWith("SWITCH") ? `to the ${mii.eyes.squash < 3 ? "left" : "right"}` : `times`}.`,
            "rotation": `Rotate the outer edge of the eyes all the way down, then rotate it ${mii.eyes.rotation} ticks back up.`,
            "distanceApart": `Move the eyes ${mii.eyes.distanceApart < 2 ? `${2 - mii.eyes.distanceApart} closer` : `${mii.eyes.distanceApart - 2} further apart`}.`,
            "yPosition": `Move the eyes ${mii.eyes.yPosition < 12 ? `${12 - mii.eyes.yPosition} ticks up.` : `${mii.eyes.yPosition - 12} ticks down.`}`
        },
        "eyebrows": {
            "type": `Set the eyebrows to the one ${formatGridPos(getAs(mii, type, "eyebrows.type"))}.`,
            "color": `Set the eyebrows color to the one ${formatColorPos(getAs(mii, type, "eyebrows.color"))}.`,
            "size": `Make the eyebrows ${mii.eyebrows.size < 4 ? `${4 - mii.eyebrows.size} smaller` : `${mii.eyebrows.size - 4} larger`}.`,
            "squash": `${mii.eyebrows.squash < 3 ? `S` : `Uns`}quash the eyebrows ${mii.eyebrows.squash < 3 ? 3 - mii.eyebrows.squash : mii.eyebrows.squash - 3} ${type.startsWith("SWITCH") ? `to the ${mii.eyebrows.squash < 3 ? "left" : "right"}` : `times`}.`,
            "rotation": `Rotate the outer edge of the eyebrows ${mii.eyebrows.rotation < 6 ? 6 - mii.eyebrows.rotation : mii.eyebrows.rotation - 6} ticks ${mii.eyebrows.rotation < 6 ? "down" : "up"}.`,
            "distanceApart": `Move the eyebrows ${mii.eyebrows.distanceApart < 2 ? `${2 - mii.eyebrows.distanceApart} closer` : `${mii.eyebrows.distanceApart - 2} further apart`}.`,
            "yPosition": `Move the eyebrows ${mii.eyebrows.yPosition < 7 ? `${7 - mii.eyebrows.yPosition} ticks up.` : `${mii.eyebrows.yPosition - 7} ticks down.`}`
        },
        "nose": {
            "type": `Set the nose to the one ${formatGridPos(getAs(mii, type, "nose.type"))}.`,
            "size": `Make the nose ${mii.nose.size < 4 ? `${4 - mii.nose.size} smaller` : `${mii.nose.size - 4} larger.`}`,
            "yPosition": `Move the nose ${mii.nose.yPosition < 9 ? `${9 - mii.nose.yPosition} ticks up.` : `${mii.nose.yPosition - 9} ticks down.`}`
        },
        "mouth": {
            "type": `Set the mouth to the one ${formatGridPos(getAs(mii, type, "mouth.type"))}.`,
            "color": `Set the mouth color to the one ${formatColorPos(getAs(mii, type, "mouth.color"))}.`,
            "size": `Make the mouth ${mii.mouth.size < 4 ? `${4 - mii.mouth.size} smaller` : `${mii.mouth.size - 4} larger.`}`,
            "squash": `${mii.mouth.squash < 3 ? `S` : `Uns`}quash the mouth ${mii.mouth.squash < 3 ? 3 - mii.mouth.squash : mii.mouth.squash - 3} ${type === "SWITCH" ? `to the ${mii.mouth.squash < 3 ? "left" : "right"}` : `times`}.`,
            "yPosition": `Move the mouth ${mii.mouth.yPosition < 13 ? `${13 - mii.mouth.yPosition} ticks up.` : `${mii.mouth.yPosition - 13} ticks down.`}`
        },
        "beard": {
            "mustache": {
                "type": `Set the mustache type to the one ${formatGridPos(getAs(mii, type, "beard.mustache.type"))}.`,
                "size": `Make the mustache ${mii.beard.mustache.size < 4 ? `${4 - mii.beard.mustache.size} smaller` : `${mii.beard.mustache.size - 4} larger.`}`,
                "yPosition": `Move the mustache ${mii.beard.mustache.yPosition < 10 ? `${10 - mii.beard.mustache.yPosition} ticks up.` : `${mii.beard.mustache.yPosition - 10} ticks down.`}`
            },
            "type": `Set the beard type to the one ${formatGridPos(getAs(mii, type, "beard.type"))}.`,
            "color": `Set the beard color to the one ${formatColorPos(getAs(mii, type, "beard.color"))}.`
        },
        "glasses": {
            "type": `Set the glasses type to the one ${formatGridPos(getAs(mii, type, "glasses.type"))}.`,
            "color": `Set the glasses color to the one ${formatColorPos(getAs(mii, type, "glasses.color"))}.`,
            "size": `Make the glasses ${mii.glasses.size < 4 ? `${4 - mii.glasses.size} smaller` : `${mii.glasses.size - 4} larger.`}`,
            "yPosition": `Move the glasses ${mii.glasses.yPosition < 10 ? `${10 - mii.glasses.yPosition} ticks up.` : `${mii.glasses.yPosition - 10} ticks down.`}`
        },
        "mole": {
            "on": `Turn the mole ${mii.mole.on ? "on" : "off"}.`,
            "size": `Make the mole ${mii.mole.size < 4 ? `${4 - mii.mole.size} smaller` : `${mii.mole.size - 4} larger.`}`,
            "xPosition": `Move the mole ${mii.mole.xPosition < 2 ? `${2 - mii.mole.xPosition} ticks to the left.` : `${mii.mole.xPosition - 2} ticks to the right.`}`,
            "yPosition": `Move the mole ${mii.mole.yPosition < 20 ? `${20 - mii.mole.yPosition} ticks up.` : `${mii.mole.yPosition - 20} ticks down.`}`
        }
    };
}

//This is the entry function that returns the instructions
function makeInstructions(mii, type = "SWITCH") {
    type = type.toUpperCase().replaceAll(" ", "");
    if (!ConsoleFormats.hasOwnProperty(type)) {
        throw new Error(`${type} is not a valid type, expected one of ${Object.keys(ConsoleFormats).join(", ")}.`);
    }
    mii = decodeMii(mii);
    if (mii && typeof mii.then === "function") {
        return mii.then(decoded => makeInstructions(decoded, type));
    }

    if (type !== "SWITCH") {
        mii = backPort(mii, type);
    }

    Object.keys(mappings).forEach(def=>{
        if(getNestedValue(mii,mappings[def])==undefined){
            if(defaultMappings.hasOwnProperty(def)){
                setNestedValue(mii,mappings[def],defaultMappings[def]);
            }
            else{
                setNestedValue(mii,mappings[def],0);
            }
        }
    });

    var instrs = buildInstructions(mii, type);
    Object.keys(mappings).forEach(key => {
        const val = getNestedValue(mii, mappings[key]);
        const def = getDefaultFor(key, val);

        if (val === undefined || val === null || (defaultsEqual(val, def) && !ignoredInstructionDefaults.includes(key))) {
            deleteNestedValue(instrs, mappings[key]);
        }
    });



    return instrs;
}

export {
    makeInstructions,

    getAs,
    setAs
}
