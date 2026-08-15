import * as fs from 'fs';
import * as nodePath from 'path';
import { fileURLToPath } from 'url';
let THREE;
const BGRA8Unorm = 'bgra8unorm';

import * as processMii from './miiProcess.js';
import { loadCgfxModelFromFS } from './cgfxLoader.js';
import {
    decodeCflModel,
    decodeCflTexture,
    loadCflResourceFromFS,
    parseCflResource
} from './cflResourceLoader.js';
import { normalizeGlassesTypeFor3DSRender } from './renderNormalization.js';

import { isNode } from './platform.js';

const moduleDir = isNode
    ? (typeof __dirname === "string" ? __dirname : nodePath.dirname(fileURLToPath(import.meta.url)))
    : ".";
const tomodachiModelScale = 8;
const FFLExpression = Object.freeze({ NORMAL: 0, SMILE: 1, ANGER: 2, SORROW: 3, SURPRISE: 4, BLINK: 5, OPEN_MOUTH: 6, HAPPY: 7, MAX: 70 });

let pngWriterPromise;
async function encodePngImage(width, height, bgraPixels) {
    if (!pngWriterPromise) {
        pngWriterPromise = import('pngjs');
    }
    const pngjs = await pngWriterPromise;
    const PNG = pngjs?.PNG ?? pngjs?.default?.PNG ?? pngjs?.default;
    if (!PNG) {
        throw new Error("pngjs PNG encoder unavailable");
    }

    const rgba = Buffer.alloc(bgraPixels.length);
    for (let i = 0; i < bgraPixels.length; i += 4) {
        // WebGPU readback is BGRA; PNG writer expects RGBA.
        rgba[i] = bgraPixels[i + 2];
        rgba[i + 1] = bgraPixels[i + 1];
        rgba[i + 2] = bgraPixels[i];
        rgba[i + 3] = bgraPixels[i + 3];
    }

    const png = new PNG({ width, height });
    png.data = rgba;
    return PNG.sync.write(png);
}

async function normalizeDecodedMiiForRender(data) {
    const normalized = structuredClone(await processMii.decodeMii(data));

    if (Number.isInteger(normalized?.glasses?.type)) {
        normalized.glasses.type = normalizeGlassesTypeFor3DSRender(normalized.glasses.type);
    }

    return normalized;
}

let webgpuPromise;
async function getWebGPU() {
    if (!webgpuPromise) {
        webgpuPromise = import('webgpu');
    }
    return webgpuPromise;
}

/**
 * Adds WebGPU related extensions to the global scope
 * if using Node.js. It defines navigator, as well as
 * userAgent and VideoFrame as they are used by Three.js.
 * @param {typeof globalThis} obj - The globalThis object to assign globals to.
 */
async function addWebGPUExtensions(obj = globalThis) {
    // @ts-ignore -- Incomplete dummy type.
    obj.VideoFrame ??= (class VideoFrame { });
    const selfValue = obj.self ?? obj;
    obj.self ??= selfValue;
    selfValue.VideoFrame ??= obj.VideoFrame;
    selfValue.requestAnimationFrame ??= function requestAnimationFrame() { };
    selfValue.cancelAnimationFrame ??= function cancelAnimationFrame() { };
    obj.Event ??= class Event {
        constructor(type = '') { this.type = type; }
    };
    obj.CustomEvent ??= class CustomEvent extends obj.Event {
        constructor(type = '', eventInitDict = {}) {
            super(type);
            this.detail = eventInitDict.detail;
        }
    };
    for (const target of [obj, selfValue]) {
        target.Event ??= obj.Event;
        target.CustomEvent ??= obj.CustomEvent;
        target.addEventListener ??= function addEventListener() { };
        target.removeEventListener ??= function removeEventListener() { };
        target.dispatchEvent ??= function dispatchEvent() { return true; };
    }

    const syncSelfWebGPUGlobals = (globals = obj) => {
        for (const key of Object.getOwnPropertyNames(globals)) {
            if (key.startsWith("GPU") && globals[key] !== undefined) {
                selfValue[key] ??= globals[key];
            }
        }
    };

    if (obj.navigator?.gpu) {
        syncSelfWebGPUGlobals();
        return;
    }

    const { globals, create } = await getWebGPU();
    Object.assign(obj, globals); // Merge WebGPU globals.
    Object.assign(selfValue, globals);
    syncSelfWebGPUGlobals(globals);

    // @ts-ignore -- Incomplete navigator type.
    const navigatorValue = {
        ...(obj.navigator ?? {}),
        gpu: create([]),
        userAgent: obj.navigator?.userAgent ?? ''
    };

    try {
        obj.navigator = navigatorValue;
        if (obj.navigator?.gpu !== navigatorValue.gpu) {
            throw new Error("navigator assignment was ignored");
        }
    }
    catch {
        Object.defineProperty(obj, "navigator", {
            configurable: true,
            value: navigatorValue
        });
    }
}

/**
 * @param {number} width - Width of the canvas.
 * @param {number} height - Height of the canvas.
 * @param {typeof HTMLCanvasElement.prototype.getContext} getContext -
 * Function that gets the context from the canvas.
 * @returns {HTMLCanvasElement} Mock canvas-like object for Three.js to use.
 */
const getCanvas = (width, height, getContext) =>
    ({
        width, height,
        // @ts-expect-error -- Incomplete style type.
        style: {},
        addEventListener() { },
        removeEventListener() { },
        getContext
    });

/**
 * Creates the renderer. The default sizes create a 1x1 swapchain texture.
 * @param {number} [width] - Width for the canvas/renderer.
 * @param {number} [height] - Height for the canvas/renderer.
 * @returns {Promise<import('three/webgpu').Renderer>} The created renderer.
 */
async function createThreeRenderer(width = 1, height = 1) {
    /**
     * Dummy canvas context which has a configure()
     * function that does nothing.
     * If only render targets are used, no other functions are needed.
     */
    const gpuCanvasContext = { configure() { } };

    const canvas = getCanvas(width, height,
        // @ts-expect-error -- Does not return a real GPUCanvasContext.
        type => type === 'webgpu'
            ? gpuCanvasContext
            : console.assert(false, `unsupported canvas context type ${type}`)
    );

    // WebGLRenderer constructor sets "self" as the context. (which is window)
    // Mock all functions called on it as of r180.
    globalThis.self ??= {
        // @ts-expect-error -- Incompatible no-op requestAnimationFrame.
        requestAnimationFrame() { },
        cancelAnimationFrame() { }
    };
    // Create the Three.js renderer and scene.
    const renderer = new THREE.WebGPURenderer({
        canvas, alpha: true
    });

    /* ('init' in renderer) && */ await renderer.init();

    return renderer;
}

/**
 * Writes a 32-bit (transparent) image in Microsoft BMP format.
 * Useful for testing since it's uncompressed and can be viewed in web browsers.
 * NOTE: If the output has inverted colors, you must output BGRA instead of RGBA.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 * @param {Uint8Array} bgraPixels - Image data in BGRA format, 32 bits per pixel.
 * @returns {Uint8Array} BMP file bytes.
 */
function encodeBmpImage(width, height, bgraPixels) {
    const sizeof_BITMAPFILEHEADER = 14;
    const sizeof_DIB = 40;
    // Contains RGBA masks. This is the format GIMP emits.
    const masksSize = 16;
    const dibSize = sizeof_DIB + masksSize;
    const pixelOffset = sizeof_BITMAPFILEHEADER + dibSize;
    const fileSize = pixelOffset + bgraPixels.length;

    const bytes = new Uint8Array(fileSize);
    const view = new DataView(bytes.buffer);

    // Encode BITMAPFILEHEADER (14 bytes).
    view.setUint16(0, 0x4D42, true); // 'BM'
    view.setUint32(2, fileSize, true); // bfSize
    view.setUint16(6, 0, true); // bfReserved1
    view.setUint16(8, 0, true); // bfReserved2
    view.setUint32(10, pixelOffset, true); // bfOffBits

    // Encode BITMAPINFOHEADER (40 bytes).
    view.setUint32(14, dibSize, true); // biSize
    view.setInt32(18, width, true); // biWidth
    view.setInt32(22, -height, true); // biHeight (negative = top-down)
    view.setUint16(26, 1, true); // biPlanes
    view.setUint16(28, 32, true); // biBitCount
    view.setUint32(30, 3, true); // biCompression = BI_BITFIELDS
    view.setUint32(34, bgraPixels.length, true); // biSizeImage
    view.setInt32(38, 2835, true); // biXPelsPerMeter (~72 DPI)
    view.setInt32(42, 2835, true); // biYPelsPerMeter
    view.setUint32(46, 0, true); // biClrUsed
    view.setUint32(50, 0, true); // biClrImportant

    // Copy RGBA masks, needed for this to show up as properly transparent.
    view.setUint32(54, 0x00FF0000, true); // Red
    view.setUint32(58, 0x0000FF00, true); // Green
    view.setUint32(62, 0x000000FF, true); // Blue
    view.setUint32(66, 0xFF000000, true); // Alpha

    // Copy BGRA pixel data.
    bytes.set(bgraPixels, pixelOffset);
    return bytes;
}


var _miiFaceRes;
var isInitialised = (async () => {//Yes, ESM has top level await, however we also build for CJS which doesn't.
    if (isNode) {
        var fetchMod = await import("fetch");
        globalThis.fetch = globalThis.fetch ?? (fetchMod.default ?? fetchMod.fetch ?? fetchMod);
        await addWebGPUExtensions();
    }

    const threeBase = await import('three');
    // Optionally merge in WebGPU extras
    let threeWebGPU = {};
    try {
        threeWebGPU = await import('three/webgpu');
    }
    catch {
        // WebGPU build not available; ignore
    }
    THREE = Object.assign({}, threeBase, threeWebGPU);
    if (THREE.ColorManagement) {
        THREE.ColorManagement.enabled = true;
    }


    if (isNode) {
        // Automatically use the local CFL resource when present. Do not
        // auto-discover legacy high-resource files; Tomodachi rendering should
        // not depend on those files being in the project anymore.
        const searchFolders = [".", "..", "./cfl", "./resources", "./CFL", "./Resources", "./node_modules/miijs"];
        const searchNames = ["CFL_Res", "CFLRes", "cfl_res", "cflres"];
        const searchSuffixes = ["dat", "bin"];
        let breakNow = false;
        for (const folder of searchFolders) {
            for (const name of searchNames) {
                for (const suffix of searchSuffixes) {
                    if (fs.existsSync(`${folder}/${name}.${suffix}`)) {
                        _miiFaceRes = await fs.promises.readFile(`${folder}/${name}.${suffix}`);
                        breakNow = true;
                        break;
                    }
                }
                if (breakNow) break;
            }
            if (breakNow) break;
        }
    }
})();

const tomodachiRenderWarnings = new Set();
function warnTomodachiOnce(key, message) {
    if (tomodachiRenderWarnings.has(key)) return;
    tomodachiRenderWarnings.add(key);
    console.warn(message);
}

const miiSkinColors = [0xffd3ad, 0xffb66b, 0xde7942, 0xffaa8c, 0xad5129, 0x632c18];
const miiHairColors = [0x1e1a18, 0x402010, 0x5c180a, 0x7c3a14, 0x787880, 0x4e3e10, 0x885818, 0xd0a04a];
const miiEyeColors = [0x000000, 0x6c7070, 0x663c2c, 0x605e30, 0x4654a8, 0x387058];
const fflEyeHighlightColor = 0x00ffff;
const fflWhite = 0xffffff;
const miiMouthColorR = [0xd85208, 0xf00c08, 0xf54848, 0xf09a74, 0x8c5040];
const miiMouthColorG = [0x823018, 0x780c0c, 0x882028, 0xdc7850, 0x461e0a];
const miiGlassesColors = [0x181818, 0x603810, 0xa81008, 0x203068, 0xa86000, 0x787068];
const cflTextureSections = {
    cap: 9,
    eyes: 10,
    eyebrows: 11,
    beard: 12,
    faceline: 13,
    faceMakeup: 14,
    glasses: 15,
    mole: 16,
    mouth: 17,
    mustache: 18,
    noseline: 19
};
const cflShapeSections = {
    beard: 0,
    cap: 1,
    faceline: 2,
    forehead: 3,
    glass: 4,
    hair: 5,
    mask: 6,
    noseline: 7,
    nose: 8
};

const rawMaskLayout = {
    pixelsPerUnit: 1 / 64,
    spacingMul: 0.88961464,
    xMul: 1.7792293,
    yMul: 1.0760943,
    quadScaleX: 0.88961464,
    quadScaleY: 0.9276675,
    xAdd: 3.5323312,
    yAdd: 4.629278
};
rawMaskLayout.eyeY = rawMaskLayout.yAdd + 13.822246;
rawMaskLayout.eyebrowY = rawMaskLayout.yAdd + 11.920528;
rawMaskLayout.mouthY = rawMaskLayout.yAdd + 24.629572;
rawMaskLayout.mustacheY = rawMaskLayout.yAdd + 27.134275;
rawMaskLayout.moleX = rawMaskLayout.xAdd + 14.233834;
rawMaskLayout.moleY = rawMaskLayout.yAdd + 11.178394 + 2 * rawMaskLayout.yMul;

const eyeRotationNeutral = [
    3, 4, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 3, 3, 4,
    4, 4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 4, 4, 3, 4, 4,
    4, 3, 3, 3, 4, 4, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 4, 4, 4, 4, 3, 4, 4, 3, 4, 4
];

const eyebrowRotationNeutral = [
    6, 6, 5, 7, 6, 7, 6, 7, 4, 7, 6, 8,
    5, 5, 6, 6, 7, 7, 6, 6, 5, 6, 7, 5
];

function clampNumber(value, min, max, fallback = min) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

function miiPaletteColor(palette, index, fallbackIndex = 0) {
    const safeIndex = Math.trunc(clampNumber(index, 0, palette.length - 1, fallbackIndex));
    return palette[safeIndex] ?? palette[fallbackIndex] ?? 0xffffff;
}

function getTomodachiBodyScaleFromFields(fields = {}) {
    const build = clampNumber(fields?.general?.weight, 0, 127, 64);
    const height = clampNumber(fields?.general?.height, 0, 127, 64);
    const m = 128;
    const x = (build * (height * (0.47 / m) + 0.4)) / m +
        height * (0.23 / m) + 0.4;
    const y = (height * (0.77 / m)) + 0.5;
    return new THREE.Vector3(x, y, x);
}

function resolveCflResourcePath(opts = {}) {
    if (!isNode) return null;
    const candidates = [
        opts.cflResPath,
        opts.faceResPath,
        nodePath.resolve(process.cwd(), "CFL_Res.dat"),
        nodePath.resolve(moduleDir, "..", "CFL_Res.dat")
    ];
    return candidates.find(candidate => candidate && fs.existsSync(candidate)) ?? null;
}

function cflCoverageAlpha(decoded, offset) {
    const rgbAlpha = Math.max(decoded.rgba[offset], decoded.rgba[offset + 1], decoded.rgba[offset + 2]);
    return decoded.format === 0x00 || decoded.format === 0x02 ||
        decoded.format === 0x04 || decoded.format === 0x05 ||
        decoded.format === 0x08 || decoded.format === 0x09 ||
        decoded.format === 0x0a
        ? Math.min(decoded.rgba[offset + 3], rgbAlpha || decoded.rgba[offset + 3])
        : rgbAlpha;
}

function colorToRgb(color) {
    const threeColor = color?.isColor ? color : new THREE.Color(color ?? 0xffffff);
    return [threeColor.r, threeColor.g, threeColor.b];
}

function clampUnit(value) {
    return Math.max(0, Math.min(1, value));
}

function sampleCflModulatedPixel(decoded, offset, color, options = {}) {
    const r = decoded.rgba[offset + 0] / 255;
    const g = decoded.rgba[offset + 1] / 255;
    const b = decoded.rgba[offset + 2] / 255;
    const coverage = cflCoverageAlpha(decoded, offset) / 255;
    const mode = options.modulateMode ?? "tint";

    if (mode === "texture") {
        return [
            decoded.rgba[offset + 0],
            decoded.rgba[offset + 1],
            decoded.rgba[offset + 2],
            decoded.rgba[offset + 3]
        ];
    }

    if (mode === "mode2") {
        const [colorR, colorG, colorB] = options.colors ?? [0xffffff, 0xffffff, 0x000000];
        const cr = colorToRgb(colorR);
        const cg = colorToRgb(colorG);
        const cb = colorToRgb(colorB);
        return [
            Math.round(clampUnit(cr[0] * r + cg[0] * g + cb[0] * b) * 255),
            Math.round(clampUnit(cr[1] * r + cg[1] * g + cb[1] * b) * 255),
            Math.round(clampUnit(cr[2] * r + cg[2] * g + cb[2] * b) * 255),
            decoded.rgba[offset + 3]
        ];
    }

    if (mode === "mode3") {
        const tint = colorToRgb(color);
        const alpha = decoded.rgba[offset + 0] / 255;
        return [
            Math.round(tint[0] * 255),
            Math.round(tint[1] * 255),
            Math.round(tint[2] * 255),
            Math.round(alpha * 255)
        ];
    }

    if (mode === "mode4") {
        const tint = colorToRgb(color);
        const alpha = (decoded.format === 0x04 ? decoded.rgba[offset + 3] : decoded.rgba[offset + 0]) / 255;
        const value = decoded.rgba[offset + 1] / 255;
        return [
            Math.round(tint[0] * value * 255),
            Math.round(tint[1] * value * 255),
            Math.round(tint[2] * value * 255),
            Math.round(alpha * 255)
        ];
    }

    const tint = colorToRgb(color);
    return [
        Math.round(tint[0] * 255),
        Math.round(tint[1] * 255),
        Math.round(tint[2] * 255),
        Math.round(coverage * 255)
    ];
}

function blendSourceOver(target, offset, source) {
    const alpha = source[3] / 255;
    if (alpha <= 0) return;

    const existingAlpha = target[offset + 3] / 255;
    const outAlpha = alpha + existingAlpha * (1 - alpha);
    if (outAlpha <= 0) return;

    target[offset + 0] = Math.round((source[0] * alpha + target[offset + 0] * existingAlpha * (1 - alpha)) / outAlpha);
    target[offset + 1] = Math.round((source[1] * alpha + target[offset + 1] * existingAlpha * (1 - alpha)) / outAlpha);
    target[offset + 2] = Math.round((source[2] * alpha + target[offset + 2] * existingAlpha * (1 - alpha)) / outAlpha);
    target[offset + 3] = Math.round(outAlpha * 255);
}

function overlayCflTexture(target, targetSize, decoded, cx, cy, width, height, color, options = {}) {
    if (!decoded || width <= 0 || height <= 0) return;

    const targetWidth = options.targetWidth ?? targetSize;
    const targetHeight = options.targetHeight ?? targetSize;
    const cos = Math.cos(-(options.rotation ?? 0));
    const sin = Math.sin(-(options.rotation ?? 0));
    const halfW = width / 2;
    const halfH = height / 2;
    const radius = Math.ceil(Math.max(width, height) * 0.75);
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(targetWidth - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(targetHeight - 1, Math.ceil(cy + radius));

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const dx = x - cx;
            const dy = y - cy;
            let localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;
            if (options.mirrorX) localX = -localX;
            if (localX < -halfW || localX > halfW || localY < -halfH || localY > halfH) continue;

            const u = Math.max(0, Math.min(decoded.width - 1, Math.floor(((localX / width) + 0.5) * decoded.width)));
            const v = Math.max(0, Math.min(decoded.height - 1, Math.floor(((localY / height) + 0.5) * decoded.height)));
            const src = (v * decoded.width + u) * 4;
            const dst = (y * targetWidth + x) * 4;
            blendSourceOver(target, dst, sampleCflModulatedPixel(decoded, src, color, options));
        }
    }
}

function rawMaskUnit(textureSize) {
    return textureSize * rawMaskLayout.pixelsPerUnit;
}

function rawMaskPart(textureSize, x, y, width, height, origin = "center", minHeight = 0) {
    const unit = rawMaskUnit(textureSize);
    const px = x * unit;
    const py = y * unit;
    const finalWidth = width * unit * rawMaskLayout.quadScaleX;
    const rawHeight = Math.max(height * unit, minHeight);
    const finalHeight = rawHeight * rawMaskLayout.quadScaleY;
    let centerX = px;
    if (origin === "left") centerX -= finalWidth / 2;
    else if (origin === "right") centerX += finalWidth / 2;
    return { x: centerX, y: py, width: finalWidth, height: finalHeight };
}

function rawMaskRotation(value, neutralByType, type, fallbackNeutral) {
    const neutral = neutralByType[type] ?? fallbackNeutral;
    const ticks = (value + 32 - neutral) % 32;
    return ticks * (Math.PI * 2 / 32);
}

function adjustedEyeHeight(height, type) {
    return type === 14 || type === 26 ? Math.max(height, 12) : height;
}

function adjustedMouthHeight(height, type) {
    return [3, 15, 19, 20, 21, 23, 25].includes(type) ? Math.max(height, 12) : height;
}

function createCflFaceTexture(resource, opts = {}) {
    const size = 512;
    const pixels = new Uint8Array(size * size * 4);
    const eyeColor = miiPaletteColor(miiEyeColors, opts?.eyes?.color, 0);
    const hairColor = miiPaletteColor(miiHairColors, opts?.eyebrows?.color ?? opts?.hair?.color, 1);
    const featureColor = 0x000000;
    const mouthColorIndex = Math.trunc(clampNumber(opts?.mouth?.color, 0, miiMouthColorR.length - 1, 0));

    const eyeType = Math.trunc(clampNumber(opts?.eyes?.type, 0, 61, 0));
    const eyeTexture = decodeCflTexture(resource, cflTextureSections.eyes, eyeType);
    const eyeScale = 0.4 * clampNumber(opts?.eyes?.size, 0, 7, 4) + 1.0;
    const eyeScaleY = 0.12 * clampNumber(opts?.eyes?.squash, 0, 6, 3) + 0.64;
    const eyeWidth = 5.34375 * eyeScale;
    const eyeHeight = 4.5 * eyeScale * eyeScaleY;
    const eyeY = clampNumber(opts?.eyes?.yPosition, 0, 18, 12) * rawMaskLayout.yMul + rawMaskLayout.eyeY;
    const eyeSpacing = clampNumber(opts?.eyes?.distanceApart, 0, 12, 2) * rawMaskLayout.spacingMul;
    const eyeAngle = rawMaskRotation(
        Math.trunc(clampNumber(opts?.eyes?.rotation, 0, 7, eyeRotationNeutral[eyeType] ?? 4)),
        eyeRotationNeutral,
        eyeType,
        4
    );
    for (const side of [-1, 1]) {
        const origin = side < 0 ? "left" : "right";
        const part = rawMaskPart(
            size,
            32 + side * eyeSpacing,
            eyeY,
            eyeWidth,
            eyeHeight,
            origin,
            adjustedEyeHeight(eyeHeight * rawMaskUnit(size), eyeType)
        );
        overlayCflTexture(pixels, size, eyeTexture, part.x, part.y, part.width, part.height, eyeColor, {
            mirrorX: side < 0,
            rotation: side < 0 ? eyeAngle : -eyeAngle,
            modulateMode: "mode2",
            colors: [fflEyeHighlightColor, fflWhite, eyeColor]
        });
    }

    const eyebrowType = Math.trunc(clampNumber(opts?.eyebrows?.type, 0, 23, 0));
    const browTexture = decodeCflTexture(resource, cflTextureSections.eyebrows, eyebrowType);
    const browScale = 0.4 * clampNumber(opts?.eyebrows?.size, 0, 8, 4) + 1.0;
    const browScaleY = 0.12 * clampNumber(opts?.eyebrows?.squash, 0, 6, 3) + 0.64;
    const browWidth = 5.0625 * browScale;
    const browHeight = 4.5 * browScale * browScaleY;
    const browY = clampNumber(opts?.eyebrows?.yPosition, 0, 18, 7) * rawMaskLayout.yMul + rawMaskLayout.eyebrowY;
    const browSpacing = clampNumber(opts?.eyebrows?.distanceApart, 0, 12, 2) * rawMaskLayout.spacingMul;
    const browAngle = rawMaskRotation(
        Math.trunc(clampNumber(opts?.eyebrows?.rotation, 0, 11, eyebrowRotationNeutral[eyebrowType] ?? 6)),
        eyebrowRotationNeutral,
        eyebrowType,
        6
    );
    for (const side of [-1, 1]) {
        const origin = side < 0 ? "left" : "right";
        const part = rawMaskPart(size, 32 + side * browSpacing, browY, browWidth, browHeight, origin);
        overlayCflTexture(pixels, size, browTexture, part.x, part.y, part.width, part.height, hairColor, {
            mirrorX: side < 0,
            rotation: side < 0 ? browAngle : -browAngle,
            modulateMode: "mode3"
        });
    }

    const noseType = Math.trunc(clampNumber(opts?.nose?.type, 0, 17, 0));
    if (!opts.maskOnly) {
        const noseTexture = decodeCflTexture(resource, cflTextureSections.noseline, noseType);
        const noseScale = clampNumber(opts?.nose?.size, 0, 8, 4) * 0.175 + 0.4;
        const noseY = clampNumber(opts?.nose?.yPosition, 0, 18, 9) * rawMaskLayout.yMul + rawMaskLayout.yAdd + 20.2;
        const nosePart = rawMaskPart(size, 32, noseY, 16 * noseScale, 16 * noseScale, "center");
        overlayCflTexture(
            pixels,
            size,
            noseTexture,
            nosePart.x,
            nosePart.y,
            nosePart.width,
            nosePart.height,
            0x6c3f2b
        );
    }

    const mouthType = Math.trunc(clampNumber(opts?.mouth?.type, 0, 36, 0));
    const mouthTexture = decodeCflTexture(resource, cflTextureSections.mouth, mouthType);
    const mouthScale = 0.4 * clampNumber(opts?.mouth?.size, 0, 8, 4) + 1.0;
    const mouthScaleY = 0.12 * clampNumber(opts?.mouth?.squash, 0, 6, 3) + 0.64;
    const mouthWidth = 6.1875 * mouthScale;
    const mouthHeight = 4.5 * mouthScale * mouthScaleY;
    const mouthY = clampNumber(opts?.mouth?.yPosition, 0, 18, 13) * rawMaskLayout.yMul + rawMaskLayout.mouthY;
    const mouthPart = rawMaskPart(
        size,
        32,
        mouthY,
        mouthWidth,
        mouthHeight,
        "center",
        adjustedMouthHeight(mouthHeight * rawMaskUnit(size), mouthType)
    );
    overlayCflTexture(
        pixels,
        size,
        mouthTexture,
        mouthPart.x,
        mouthPart.y,
        mouthPart.width,
        mouthPart.height,
        null,
        {
            modulateMode: "mode2",
            colors: [miiMouthColorR[mouthColorIndex], miiMouthColorG[mouthColorIndex], fflWhite]
        }
    );

    const mustacheType = Math.trunc(clampNumber(opts?.beard?.mustache?.type, 0, 5, 0));
    if (mustacheType > 0) {
        const mustacheTexture = decodeCflTexture(resource, cflTextureSections.mustache, mustacheType);
        const mustacheScale = 0.4 * clampNumber(opts?.beard?.mustache?.size, 0, 8, 4) + 1.0;
        const mustacheY = clampNumber(opts?.beard?.mustache?.yPosition, 0, 16, 10) * rawMaskLayout.yMul + rawMaskLayout.mustacheY;
        const mustacheWidth = 4.5 * mustacheScale;
        const mustacheHeight = 9.0 * mustacheScale;
        for (const side of [-1, 1]) {
            const part = rawMaskPart(size, 32, mustacheY, mustacheWidth, mustacheHeight, side < 0 ? "left" : "right");
            overlayCflTexture(pixels, size, mustacheTexture, part.x, part.y, part.width, part.height, hairColor, {
                mirrorX: side < 0,
                modulateMode: "mode3"
            });
        }
    }

    const glassesType = Math.trunc(clampNumber(opts?.glasses?.type, 0, 11, 0));
    if (glassesType > 0) {
        const glassesTexture = decodeCflTexture(resource, cflTextureSections.glasses, glassesType);
        const glassesScale = clampNumber(opts?.glasses?.size, 0, 7, 4) * 0.15 + 0.4;
        const glassesRawY = eyeY + 1.25 + (clampNumber(opts?.glasses?.yPosition, 0, 20, 10) - 10) * 0.5;
        const glassesPart = rawMaskPart(size, 32, glassesRawY, 18 * glassesScale, 6 * glassesScale, "center");
        const glassesHeight = glassesTexture ? glassesPart.width * (glassesTexture.height / glassesTexture.width) : glassesPart.height;
        overlayCflTexture(
            pixels,
            size,
            glassesTexture,
            glassesPart.x,
            glassesPart.y,
            glassesPart.width,
            glassesHeight,
            miiPaletteColor(miiGlassesColors, opts?.glasses?.color, 0),
            { modulateMode: "mode4" }
        );
    }

    if (opts?.mole?.on) {
        const moleTexture = decodeCflTexture(resource, cflTextureSections.mole, 1);
        const moleScale = 0.4 * clampNumber(opts?.mole?.size, 0, 8, 4) + 1.0;
        const moleX = clampNumber(opts?.mole?.xPosition, 0, 16, 2) * rawMaskLayout.xMul + rawMaskLayout.moleX;
        const moleY = clampNumber(opts?.mole?.yPosition, 0, 30, 20) * rawMaskLayout.yMul + rawMaskLayout.moleY;
        const molePart = rawMaskPart(size, moleX, moleY, moleScale, moleScale, "center");
        overlayCflTexture(pixels, size, moleTexture, molePart.x, molePart.y, molePart.width, molePart.height, 0x120f0f, {
            modulateMode: "mode3"
        });
    }

    const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

function fillTexturePixels(pixels, color) {
    const rgb = colorToRgb(color);
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i + 0] = Math.round(rgb[0] * 255);
        pixels[i + 1] = Math.round(rgb[1] * 255);
        pixels[i + 2] = Math.round(rgb[2] * 255);
        pixels[i + 3] = 255;
    }
}

function createCflFacelineTexture(resource, opts = {}) {
    const width = 256;
    const height = 512;
    const pixels = new Uint8Array(width * height * 4);
    const skinColor = miiPaletteColor(miiSkinColors, opts?.face?.color, 0);
    fillTexturePixels(pixels, skinColor);

    const faceMakeup = decodeCflTexture(
        resource,
        cflTextureSections.faceMakeup,
        Math.trunc(clampNumber(opts?.face?.makeup, 0, 11, 0))
    );
    overlayCflTexture(pixels, width, faceMakeup, width / 2, height / 2, width, height, null, {
        targetHeight: height,
        modulateMode: "texture"
    });

    const faceLine = decodeCflTexture(
        resource,
        cflTextureSections.faceline,
        Math.trunc(clampNumber(opts?.face?.feature, 0, 11, 0))
    );
    overlayCflTexture(pixels, width, faceLine, width / 2, height / 2, width, height, 0x000000, {
        targetHeight: height,
        modulateMode: "mode3"
    });

    const beardType = Math.trunc(clampNumber(opts?.beard?.type, 0, 5, 0));
    if (beardType >= 4) {
        const beardTexture = decodeCflTexture(resource, cflTextureSections.beard, beardType - 3);
        const beardColor = miiPaletteColor(miiHairColors, opts?.beard?.color ?? opts?.hair?.color, 1);
        overlayCflTexture(pixels, width, beardTexture, width / 2, height / 2, width, height, beardColor, {
            targetHeight: height,
            modulateMode: "mode3"
        });
    }

    const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
}

function makeCflSolidMaterial(color) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        metalness: 0,
        side: THREE.DoubleSide
    });
}

function makeCflMappedMaterial(texture, fallbackColor) {
    return new THREE.MeshBasicMaterial({
        color: texture ? 0xffffff : fallbackColor,
        map: texture ?? null,
        side: THREE.DoubleSide
    });
}

function makeCflTextureMaterial(texture) {
    return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.01,
        depthWrite: false,
        side: THREE.DoubleSide
    });
}

function makeCflOverlayMaterial(texture) {
    const material = makeCflTextureMaterial(texture);
    material.depthTest = true;
    material.polygonOffset = true;
    material.polygonOffsetFactor = -1;
    material.polygonOffsetUnits = -1;
    return material;
}

function makeCflTransparentMaterial(texture, color = 0xffffff) {
    const material = new THREE.MeshBasicMaterial({
        color,
        map: texture ?? null,
        transparent: true,
        alphaTest: 0.02,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    material.depthTest = true;
    return material;
}

function makeCflTintTexture(resource, sectionIndex, itemIndex, color = 0x111111, modulateMode = "tint") {
    const decoded = decodeCflTexture(resource, sectionIndex, itemIndex);
    if (!decoded) return null;

    const pixels = new Uint8Array(decoded.width * decoded.height * 4);
    for (let i = 0; i < decoded.rgba.length; i += 4) {
        const pixel = sampleCflModulatedPixel(decoded, i, color, { modulateMode });
        pixels[i + 0] = pixel[0];
        pixels[i + 1] = pixel[1];
        pixels[i + 2] = pixel[2];
        pixels[i + 3] = pixel[3];
    }

    const texture = new THREE.DataTexture(pixels, decoded.width, decoded.height, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = modulateMode === "mode4" ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    texture.wrapT = modulateMode === "mode4" ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
}

function vec3FromArray(value, fallback = [0, 0, 0]) {
    const source = Array.isArray(value) ? value : fallback;
    return new THREE.Vector3(
        Number.isFinite(source[0]) ? source[0] : fallback[0],
        Number.isFinite(source[1]) ? source[1] : fallback[1],
        Number.isFinite(source[2]) ? source[2] : fallback[2]
    );
}

function createTransformedCflGeometry(decoded, options = {}) {
    if (!decoded?.vertices?.length || !decoded?.indices?.length) return null;

    const scaleX = Number.isFinite(options.scaleX) ? options.scaleX : 1;
    const scaleY = Number.isFinite(options.scaleY) ? options.scaleY : 1;
    let scaleZ = Number.isFinite(options.scaleZ) ? options.scaleZ : (scaleX + scaleY) * 0.5;
    if (options.limitNoseScaleZ) scaleZ = Math.min(scaleZ, 1.1);

    const translate = options.translate ?? new THREE.Vector3();
    const flipX = Boolean(options.flipX);
    const positions = new Float32Array(decoded.vertices.length * 3);
    for (let i = 0; i < decoded.vertices.length; i++) {
        const vertex = decoded.vertices[i];
        const x = (flipX ? -vertex[0] : vertex[0]) * scaleX + translate.x;
        const y = vertex[1] * scaleY + translate.y;
        const z = vertex[2] * scaleZ + translate.z;
        positions[i * 3 + 0] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    if (decoded.normals?.length >= decoded.vertices.length) {
        const normals = new Float32Array(decoded.vertices.length * 3);
        for (let i = 0; i < decoded.vertices.length; i++) {
            const normal = decoded.normals[i] ?? [0, 0, 1];
            const nx = flipX ? -normal[0] : normal[0];
            const ny = normal[1];
            const nz = normal[2];
            const length = Math.hypot(nx, ny, nz) || 1;
            normals[i * 3 + 0] = nx / length;
            normals[i * 3 + 1] = ny / length;
            normals[i * 3 + 2] = nz / length;
        }
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    }

    if (decoded.uvs?.length >= decoded.vertices.length) {
        const uvs = new Float32Array(decoded.vertices.length * 2);
        for (let i = 0; i < decoded.vertices.length; i++) {
            const uv = decoded.uvs[i] ?? [0, 0];
            uvs[i * 2 + 0] = uv[0];
            uvs[i * 2 + 1] = uv[1];
        }
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }

    const indices = decoded.indices.slice();
    if (flipX) {
        for (let i = 0; i + 2 < indices.length; i += 3) {
            const tmp = indices[i + 1];
            indices[i + 1] = indices[i + 2];
            indices[i + 2] = tmp;
        }
    }
    const IndexArray = decoded.vertices.length > 65535 ? Uint32Array : Uint16Array;
    geometry.setIndex(new THREE.BufferAttribute(new IndexArray(indices), 1));
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
}

function createCflShapeMesh(resource, sectionIndex, itemIndex, material, options = {}) {
    const decoded = decodeCflModel(resource, sectionIndex, itemIndex);
    const geometry = createTransformedCflGeometry(decoded, options);
    if (!geometry) return null;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = options.name ?? `CFLShape_${sectionIndex}_${itemIndex}`;
    mesh.frustumCulled = false;
    mesh.renderOrder = options.renderOrder ?? 0;
    mesh.userData.cflTransform = decoded.transform;
    return mesh;
}

function addCflShape(group, resource, sectionIndex, itemIndex, material, options = {}) {
    const mesh = createCflShapeMesh(resource, sectionIndex, itemIndex, material, options);
    if (mesh) group.add(mesh);
    return mesh;
}

function decodeCflShapeWithFallback(resource, sectionIndex, preferredIndex, fallbackIndex = null) {
    const preferred = decodeCflModel(resource, sectionIndex, preferredIndex);
    if (preferred) return { decoded: preferred, index: preferredIndex };
    if (fallbackIndex != null && fallbackIndex !== preferredIndex) {
        const fallback = decodeCflModel(resource, sectionIndex, fallbackIndex);
        if (fallback) return { decoded: fallback, index: fallbackIndex };
    }
    return { decoded: null, index: preferredIndex };
}

function createCflHeadGroup(headAsset, cflResource, opts = {}, tomodachiModels = null) {
    if (!cflResource) return null;

    const skinColor = miiPaletteColor(miiSkinColors, opts?.face?.color, 0);
    const hairColor = miiPaletteColor(miiHairColors, opts?.hair?.color, 1);
    const beardColor = miiPaletteColor(miiHairColors, opts?.beard?.color ?? opts?.hair?.color, 1);
    const featureColor = 0x221817;
    const group = new THREE.Group();
    group.name = "CFLTomodachiHead";

    const faceType = Math.trunc(clampNumber(opts?.face?.type, 0, 11, 0));
    const faceline = decodeCflShapeWithFallback(cflResource, cflShapeSections.faceline, faceType, 0);
    if (!faceline.decoded) return null;

    const facelineTexture = createCflFacelineTexture(cflResource, opts);
    const facelineMesh = new THREE.Mesh(
        createTransformedCflGeometry(faceline.decoded),
        makeCflMappedMaterial(facelineTexture, skinColor)
    );
    facelineMesh.name = "CFLFaceline";
    facelineMesh.frustumCulled = false;
    group.add(facelineMesh);

    const hairPos = vec3FromArray(faceline.decoded.transform?.hairPosition);
    const faceCenter = vec3FromArray(faceline.decoded.transform?.faceCenterPosition, [0, 24.5, 26]);
    const beardPos = vec3FromArray(faceline.decoded.transform?.beardPosition);
    const hasHeadwear = Boolean(tomodachiModels?.headwear || opts.tomodachiHeadwearId != null || opts.headwearId != null || opts?.tl?.clothing?.hat);
    const hairType = Math.trunc(clampNumber(opts?.hair?.type, 0, 131, 0));
    const hairIndex = hasHeadwear ? hairType + 132 : hairType;
    const hairFlip = Boolean(opts?.hair?.flipped);
    const hairTranslate = { translate: hairPos, flipX: hairFlip };

    addCflShape(
        group,
        cflResource,
        cflShapeSections.forehead,
        hairIndex,
        makeCflSolidMaterial(skinColor),
        { ...hairTranslate, name: "CFLForehead" }
    ) ?? addCflShape(
        group,
        cflResource,
        cflShapeSections.forehead,
        hairType,
        makeCflSolidMaterial(skinColor),
        { ...hairTranslate, name: "CFLForehead" }
    );

    addCflShape(
        group,
        cflResource,
        cflShapeSections.hair,
        hairIndex,
        makeCflSolidMaterial(hairColor),
        { ...hairTranslate, name: "CFLHair" }
    ) ?? addCflShape(
        group,
        cflResource,
        cflShapeSections.hair,
        hairType,
        makeCflSolidMaterial(hairColor),
        { ...hairTranslate, name: "CFLHair" }
    );

    const beardType = Math.trunc(clampNumber(opts?.beard?.type, 0, 5, 0));
    if (beardType > 0 && beardType < 4) {
        addCflShape(
            group,
            cflResource,
            cflShapeSections.beard,
            beardType,
            makeCflSolidMaterial(beardColor),
            { translate: beardPos, name: "CFLBeard" }
        );
    }

    const noseType = Math.trunc(clampNumber(opts?.nose?.type, 0, 17, 0));
    const noseScale = clampNumber(opts?.nose?.size, 0, 8, 4) * 0.175 + 0.4;
    const nosePosition = faceCenter.clone();
    nosePosition.y += (clampNumber(opts?.nose?.yPosition, 0, 18, 9) - 8) * -1.5;
    addCflShape(
        group,
        cflResource,
        cflShapeSections.nose,
        noseType,
        makeCflSolidMaterial(skinColor),
        {
            scaleX: noseScale,
            scaleY: noseScale,
            translate: nosePosition,
            limitNoseScaleZ: true,
            name: "CFLNose"
        }
    );

    const noselineTexture = makeCflTintTexture(cflResource, cflTextureSections.noseline, noseType, featureColor, "mode3");
    addCflShape(
        group,
        cflResource,
        cflShapeSections.noseline,
        noseType,
        makeCflTransparentMaterial(noselineTexture, featureColor),
        {
            scaleX: noseScale,
            scaleY: noseScale,
            translate: nosePosition,
            limitNoseScaleZ: true,
            name: "CFLNoseline",
            renderOrder: 12
        }
    );

    const maskTexture = createCflFaceTexture(cflResource, { ...opts, maskOnly: true });
    maskTexture.flipY = false;
    maskTexture.wrapS = THREE.ClampToEdgeWrapping;
    maskTexture.wrapT = THREE.ClampToEdgeWrapping;
    addCflShape(
        group,
        cflResource,
        cflShapeSections.mask,
        faceType,
        makeCflTransparentMaterial(maskTexture),
        { name: "CFLMask", renderOrder: 10 }
    );

    const rawBox = new THREE.Box3().setFromObject(group);
    if (!Number.isFinite(rawBox.min.x) || rawBox.isEmpty()) return null;

    const referenceBox = headAsset?.model ? tomodachiHeadSurfaceBox(headAsset.model) : null;
    if (referenceBox && Number.isFinite(referenceBox.min.x) && !referenceBox.isEmpty()) {
        const normalizedRoot = new THREE.Group();
        normalizedRoot.name = "CFLNormalizedParts";
        for (const child of [...group.children]) normalizedRoot.add(child);
        group.add(normalizedRoot);

        const rawSize = rawBox.getSize(new THREE.Vector3());
        const referenceSize = referenceBox.getSize(new THREE.Vector3());
        const scale = referenceSize.y / Math.max(rawSize.y, 1e-6);
        const rawCenter = rawBox.getCenter(new THREE.Vector3());
        const referenceCenter = referenceBox.getCenter(new THREE.Vector3());
        const referenceBottom = referenceBox.min.y;

        normalizedRoot.scale.setScalar(scale);
        normalizedRoot.position.set(
            referenceCenter.x - rawCenter.x * scale,
            referenceBottom - rawBox.min.y * scale,
            referenceCenter.z - rawCenter.z * scale
        );
        if (isNode && process.env.MIIJS_DEBUG_TOMODACHI) {
            console.warn("CFL head normalization", {
                rawMin: rawBox.min.toArray(),
                rawMax: rawBox.max.toArray(),
                referenceMin: referenceBox.min.toArray(),
                referenceMax: referenceBox.max.toArray(),
                scale,
                position: normalizedRoot.position.toArray()
            });
        }
    }

    group.updateMatrixWorld(true);
    group.userData.tomodachiFaceBox = new THREE.Box3().setFromObject(facelineMesh);
    group.userData.tomodachiHeadBox = new THREE.Box3().setFromObject(group);
    return group;
}

function applyMaterialToModel(model, materialFactory) {
    model.traverse((node) => {
        if (!node.isMesh) return;
        node.material = materialFactory(node);
        node.frustumCulled = false;
    });
}

function disposeModel(model, seen = new Set()) {
    if (!model || seen.has(model)) return;
    seen.add(model);
    model.traverse?.((node) => {
        if (node.geometry && !seen.has(node.geometry)) {
            seen.add(node.geometry);
            node.geometry.dispose?.();
        }

        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of materials) {
            if (!material || seen.has(material)) continue;
            seen.add(material);
            for (const value of Object.values(material)) {
                if (value?.isTexture && !seen.has(value)) {
                    seen.add(value);
                    value.dispose?.();
                }
            }
            material.dispose?.();
        }
    });
}

function tomodachiHeadSurfaceBox(object) {
    const meshBoxes = [];
    object.updateMatrixWorld(true);
    object.traverse((node) => {
        if (!node.isMesh || !node.geometry) return;
        node.geometry.computeBoundingBox();
        if (!node.geometry.boundingBox) return;
        const box = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
        if (Number.isFinite(box.min.x) && !box.isEmpty()) meshBoxes.push(box);
    });

    if (!meshBoxes.length) return new THREE.Box3().setFromObject(object);
    if (meshBoxes.length === 1) return meshBoxes[0].clone();

    const selected = [...meshBoxes]
        .sort((a, b) => b.max.y - a.max.y)
        .slice(0, meshBoxes.length - 1);
    const box = new THREE.Box3();
    for (const meshBox of selected) box.union(meshBox);
    return box.isEmpty() ? new THREE.Box3().setFromObject(object) : box;
}

function buildTomodachiHeadModel(headAsset, cflResource, opts = {}, tomodachiModels = null) {
    const cflHead = createCflHeadGroup(headAsset, cflResource, opts, tomodachiModels);
    if (cflHead) return cflHead;

    const skinColor = miiPaletteColor(miiSkinColors, opts?.face?.color, 0);
    const group = new THREE.Group();
    group.name = "TomodachiHead";

    const base = headAsset.model;
    applyMaterialToModel(base, () => makeCflSolidMaterial(skinColor));
    group.add(base);

    const faceBox = tomodachiHeadSurfaceBox(group);
    const faceCenter = faceBox.getCenter(new THREE.Vector3());
    const faceSize = faceBox.getSize(new THREE.Vector3());
    if (cflResource && faceSize.x > 1e-6 && faceSize.y > 1e-6) {
        const featureTexture = createCflFaceTexture(cflResource, { ...opts, tomodachi: true });
        featureTexture.flipY = true;
        const overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(faceSize.x, faceSize.y),
            makeCflOverlayMaterial(featureTexture)
        );
        overlay.name = "CFLFaceFeatures";
        overlay.position.set(faceCenter.x, faceCenter.y, faceBox.max.z + 0.004);
        overlay.renderOrder = 20;
        group.add(overlay);
    }

    group.updateMatrixWorld(true);
    group.userData.tomodachiFaceBox = faceBox;
    group.userData.tomodachiHeadBox = new THREE.Box3().setFromObject(group);
    return group;
}

async function loadTomodachiCflHeadModel(opts = {}, tomodachiModels = null) {
    const cflPath = resolveCflResourcePath(opts);

    let cflResource = null;
    const cflBuffer = opts.cflResBuffer ?? opts.faceResBuffer;
    if (cflBuffer) {
        try {
            const bytes = cflBuffer instanceof Uint8Array ? cflBuffer : new Uint8Array(cflBuffer);
            cflResource = parseCflResource(bytes);
        }
        catch (error) {
            warnTomodachiOnce("cfl-resource-buffer-load", `CFL_Res buffer could not be parsed: ${error.message}`);
        }
    }
    else if (cflPath) {
        try {
            cflResource = await loadCflResourceFromFS(cflPath);
        }
        catch (error) {
            warnTomodachiOnce("cfl-resource-load", `CFL_Res could not be loaded from ${cflPath}: ${error.message}`);
        }
    }
    else if (_miiFaceRes) {
        try {
            cflResource = parseCflResource(_miiFaceRes);
        }
        catch (error) {
            warnTomodachiOnce("cfl-resource-autoload", `Auto-discovered CFL_Res could not be parsed: ${error.message}`);
        }
    }

    if (!tomodachiModels?.head) return null;
    return buildTomodachiHeadModel(tomodachiModels.head, cflResource, opts, tomodachiModels);
}

function isTomodachiRomfs(path) {
    return Boolean(path && fs.existsSync(nodePath.join(path, "model", "body")) &&
        fs.existsSync(nodePath.join(path, "model", "headwear")));
}

function resolveTomodachiRomfs(opts = {}) {
    if (!isNode) return null;

    const candidates = [
        opts.tomodachiRomfs,
        opts.tomodachiFolder,
        process.env.TOMODACHI_ROMFS,
        nodePath.resolve(process.cwd(), "romFS"),
        nodePath.resolve(moduleDir, "..", "romFS"),
        nodePath.join(moduleDir, "tomodachi-assets")
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;
        const resolved = nodePath.resolve(candidate);
        if (isTomodachiRomfs(resolved)) return resolved;
    }

    return null;
}

function parseTomodachiItemCode(value) {
    if (value == null || value === '' || value === -1) return null;
    if (Number.isInteger(value)) return value < 0 || value === 0xffff ? null : value;

    const text = String(value).replace(/[^0-9a-f]/gi, '');
    if (!text || /^f+$/i.test(text)) return null;

    let raw;
    if (text.length <= 4) {
        const padded = text.padStart(4, '0');
        raw = Number.parseInt(padded.slice(2, 4) + padded.slice(0, 2), 16);
    }
    else {
        raw = Number.parseInt(text, 16);
    }

    return Number.isFinite(raw) && raw >= 0 && raw !== 0xffff ? raw : null;
}

function formatTomodachiId(id) {
    return Math.max(0, id | 0).toString().padStart(3, '0');
}

function firstExistingPath(paths) {
    return paths.find(path => path && fs.existsSync(path)) ?? null;
}

function resolveTomodachiBodyPath(romfs, bodyId, gender) {
    const id = formatTomodachiId(bodyId ?? 0);
    const base = nodePath.join(romfs, "model", "body");
    const genderSuffix = gender === 1 ? "F" : "";
    return firstExistingPath([
        genderSuffix && nodePath.join(base, `body_body${id}${genderSuffix}.bin.dat`),
        nodePath.join(base, `body_body${id}.bin.dat`),
        genderSuffix && nodePath.join(base, `body_body000${genderSuffix}.bin.dat`),
        nodePath.join(base, "body_body000.bin.dat")
    ]);
}

function resolveTomodachiHeadwearPath(romfs, headwearId) {
    if (headwearId == null) return null;
    return firstExistingPath([
        nodePath.join(romfs, "model", "headwear", `headwear_headwear${formatTomodachiId(headwearId)}.bin.dat`)
    ]);
}

function resolveTomodachiHeadPath(romfs) {
    return firstExistingPath([
        nodePath.join(romfs, "model", "obj", "obj_mHead.bin.dat")
    ]);
}

async function loadTomodachiRenderModels(opts = {}) {
    if (!opts.tomodachi || !isNode) return null;

    const romfs = resolveTomodachiRomfs(opts);
    if (!romfs) {
        warnTomodachiOnce("missing-romfs", "Tomodachi render requested, but no RomFS/model/body + model/headwear folder was found.");
        return null;
    }

    const clothing = opts?.tl?.clothing ?? {};
    const bodyId = parseTomodachiItemCode(opts.tomodachiBodyId ?? opts.bodyId ?? clothing.outfit) ?? 0;
    const headwearId = parseTomodachiItemCode(opts.tomodachiHeadwearId ?? opts.headwearId ?? clothing.hat);
    const gender = opts?.general?.gender ?? 0;
    const bodyPath = resolveTomodachiBodyPath(romfs, bodyId, gender);
    const headwearPath = resolveTomodachiHeadwearPath(romfs, headwearId);
    const headPath = resolveTomodachiHeadPath(romfs);
    const loaded = { romfs, bodyPath, headwearPath, headPath, body: null, headwear: null, head: null, bodyId, headwearId };

    if (bodyPath) {
        try {
            loaded.body = await loadCgfxModelFromFS(bodyPath, THREE, { fallbackColor: 0x4f86c6, useTextureMap: true });
        }
        catch (error) {
            warnTomodachiOnce(`body-${bodyPath}`, `Tomodachi body ${bodyPath} could not be loaded: ${error.message}`);
        }
    }

    if (headwearPath) {
        try {
            loaded.headwear = await loadCgfxModelFromFS(headwearPath, THREE, { fallbackColor: 0xb7925e, useTextureMap: true });
        }
        catch (error) {
            warnTomodachiOnce(`headwear-${headwearPath}`, `Tomodachi headwear ${headwearPath} could not be loaded: ${error.message}`);
        }
    }

    if (headPath) {
        try {
            loaded.head = await loadCgfxModelFromFS(headPath, THREE, { fallbackColor: 0xf4c7a1, useTextureMap: false });
        }
        catch (error) {
            warnTomodachiOnce(`head-${headPath}`, `Tomodachi head ${headPath} could not be loaded: ${error.message}`);
        }
    }

    if (isNode && process.env.MIIJS_DEBUG_TOMODACHI) {
        console.warn("Tomodachi render assets", {
            romfs,
            bodyPath,
            headwearPath,
            headPath,
            hasBody: Boolean(loaded.body),
            hasHeadwear: Boolean(loaded.headwear),
            hasHead: Boolean(loaded.head)
        });
    }

    return loaded.body || loaded.headwear || loaded.head ? loaded : null;
}

function addTomodachiLights(scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 1.9);
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(2.5, 5, 4);
    const fill = new THREE.DirectionalLight(0xdde8ff, 1.0);
    fill.position.set(-3, 2.5, 2);
    scene.add(ambient, key, fill);
}

function smoothStep(edge0, edge1, value) {
    const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

function poseTomodachiBodyModel(model) {
    if (model.userData.tomodachiNeutralPose) return;

    model.traverse((node) => {
        const geometry = node.geometry;
        const positions = geometry?.attributes?.position;
        if (!positions) return;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const absX = Math.abs(x);
            let nextX = x;
            let nextY = y;

            if (y > 1.02 && absX < 0.22) {
                nextY = Math.min(nextY, 1.04 + absX * 0.7);
            }

            const side = x < -0.24 ? -1 : x > 0.24 ? 1 : 0;
            if (!side || y < 0.34 || y > 1.18) {
                if (nextY !== y) positions.setXYZ(i, nextX, nextY, z);
                continue;
            }

            const pivotX = side * 0.27;
            const pivotY = 0.88;
            const angle = side < 0 ? 1.38 : -1.38;
            const dx = nextX - pivotX;
            const dy = nextY - pivotY;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const posedX = pivotX + dx * cos - dy * sin;
            const posedY = pivotY + dx * sin + dy * cos;
            const weight = smoothStep(0.24, 0.48, absX);

            positions.setXYZ(
                i,
                nextX + (posedX - nextX) * weight,
                nextY + (posedY - nextY) * weight,
                z
            );
        }

        positions.needsUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        if (geometry.attributes.normal) {
            geometry.computeVertexNormals();
            geometry.attributes.normal.needsUpdate = true;
        }
    });

    model.userData.tomodachiNeutralPose = true;
}

function fitCameraToBox(camera, box, padding = 1.25) {
    if (!Number.isFinite(box.min.x) || box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) * padding;
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (maxDim / 2) / Math.tan(fov / 2);

    camera.position.set(center.x, center.y, center.z + dist);
    camera.near = Math.max(0.01, dist / 100);
    camera.far = dist * 100;
    camera.lookAt(center);
    camera.updateProjectionMatrix();
}

function fitTomodachiCamera(camera, root, fullBody, headAnchorY) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    if (!fullBody) {
        box.min.y = Math.max(box.min.y, headAnchorY - (0.35 * tomodachiModelScale));
    }
    fitCameraToBox(camera, box, fullBody ? 1.18 : 1.42);
}

function fitCameraToObject(camera, object3D, padding = 1.25) {
    // Ensure world matrices are current
    object3D.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(object3D);

    // Safety: if box is empty, don't move camera
    if (!Number.isFinite(box.min.x) || box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) * padding;

    // Look at center
    camera.lookAt(center);

    if (camera.isPerspectiveCamera) {
        const fov = (camera.fov * Math.PI) / 180;
        const dist = (maxDim / 2) / Math.tan(fov / 2);

        // Move camera back on its current forward axis
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir); // points "forward"
        camera.position.copy(center).addScaledVector(dir, -dist);

        camera.near = Math.max(0.01, dist / 100);
        camera.far = dist * 100;
        camera.updateProjectionMatrix();
    }
    else if (camera.isOrthographicCamera) {
        camera.left = -maxDim / 2;
        camera.right = maxDim / 2;
        camera.top = maxDim / 2;
        camera.bottom = -maxDim / 2;
        camera.near = -maxDim * 10;
        camera.far = maxDim * 10;
        camera.position.copy(center).add(new THREE.Vector3(0, 0, maxDim));
        camera.updateProjectionMatrix();
    }
}
function levelFaceCameraToObject(camera, object3D, distMultiplier = 1.15) {
    object3D.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(object3D);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // distance needed to fit object (perspective only)
    let dist = maxDim;
    if (camera.isPerspectiveCamera) {
        const fov = (camera.fov * Math.PI) / 180;
        dist = (maxDim / 2) / Math.tan(fov / 2);
    }
    dist *= distMultiplier;

    // Preserve which side of the model we're on (front/back), but REMOVE vertical component
    const dir = camera.position.clone().sub(center);
    dir.y = 0;
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.normalize();

    camera.up.set(0, 1, 0);

    // Keep camera level with the head center (no looking up/down)
    camera.position.set(
        center.x + dir.x * dist,
        center.y,                 // <-- this is the important part
        center.z + dir.z * dist
    );

    camera.lookAt(center.x, center.y, center.z);

    if (camera.isPerspectiveCamera) {
        camera.near = Math.max(0.01, dist / 100);
        camera.far = dist * 100;
        camera.updateProjectionMatrix();
    }
}

async function renderRequestToImage(renderer, request, opts = {}) {
    const scene = new THREE.Scene();
    let tomodachiModels = null;
    let cflHead = null;

    const SIZE = Number.isFinite(opts.size) ? Math.max(1, Math.floor(opts.size)) : 256;

    try {
        let camera;
        tomodachiModels = await loadTomodachiRenderModels({ ...opts, tomodachi: true });
        if (tomodachiModels?.body) {
            const root = new THREE.Group();
            root.name = "TomodachiRenderRoot";
            const bodyScale = getTomodachiBodyScaleFromFields(opts);
            const bodyModel = tomodachiModels.body.model;
            poseTomodachiBodyModel(bodyModel);
            bodyModel.scale.set(
                bodyScale.x * tomodachiModelScale,
                bodyScale.y * tomodachiModelScale,
                bodyScale.z * tomodachiModelScale
            );
            root.add(bodyModel);

            bodyModel.updateMatrixWorld(true);
            const bodyBox = new THREE.Box3().setFromObject(bodyModel);
            const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
            const headAnchorY = bodyBox.max.y - 0.03 * bodyScale.y;

            const headModel = cflHead = await loadTomodachiCflHeadModel(opts, tomodachiModels);
            if (!headModel) {
                throw new Error("Tomodachi CFL head assets are unavailable.");
            }
            headModel.scale.setScalar(tomodachiModelScale);
            headModel.updateMatrixWorld(true);
            headModel.position.set(bodyCenter.x, bodyBox.max.y, 0);
            root.add(headModel);
            headModel.updateMatrixWorld(true);

            if (tomodachiModels.headwear?.model) {
                const headwearModel = tomodachiModels.headwear.model;
                headwearModel.scale.setScalar(tomodachiModelScale);
                headwearModel.position.copy(headModel.position);
                root.add(headwearModel);
            }

            addTomodachiLights(scene);
            scene.add(root);
            camera = new THREE.PerspectiveCamera(15, 1, 0.01, 100);
            if (isNode && process.env.MIIJS_DEBUG_TOMODACHI) {
                root.updateMatrixWorld(true);
                const rootBox = new THREE.Box3().setFromObject(root);
                console.warn("Tomodachi render bounds", {
                    bodyMin: bodyBox.min.toArray(),
                    bodyMax: bodyBox.max.toArray(),
                    headAnchorY,
                    rootMin: rootBox.min.toArray(),
                    rootMax: rootBox.max.toArray(),
                    fullBody: request.fullBody
                });
            }
            fitTomodachiCamera(camera, root, request.fullBody, headAnchorY);
        }
        else {
            cflHead = await loadTomodachiCflHeadModel(opts, tomodachiModels);
            if (!cflHead) {
                throw new Error("Tomodachi CFL head assets are unavailable.");
            }
            cflHead.scale.setScalar(tomodachiModelScale);
            scene.add(cflHead);
            addTomodachiLights(scene);
            camera = new THREE.PerspectiveCamera(18, 1, 0.01, 100);
            fitCameraToObject(camera, cflHead, 1.35);
        }

        const rt = new THREE.RenderTarget(SIZE, SIZE, {
            samples: 4,
            internalFormat: BGRA8Unorm,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        });

        renderer.setRenderTarget(rt);
        renderer.render(scene, camera);

        const pixels = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, SIZE, SIZE);
        try {
            return await encodePngImage(SIZE, SIZE, pixels);
        }
        catch {
            // Fallback keeps rendering functional if PNG encoder fails unexpectedly.
            return encodeBmpImage(SIZE, SIZE, pixels);
        }
    }
    finally {
        const disposed = new Set();
        cflHead && disposeModel(cflHead, disposed);
        if (tomodachiModels) {
            tomodachiModels.body && disposeModel(tomodachiModels.body.model, disposed);
            tomodachiModels.headwear && disposeModel(tomodachiModels.headwear.model, disposed);
            tomodachiModels.head && disposeModel(tomodachiModels.head.model, disposed);
        }
    }
}

async function renderForNode(data, opts = {}) {
    await isInitialised;
    data = await normalizeDecodedMiiForRender(data);

    opts = Object.assign({
        fullBody: false,
        expression: 0,
        size: 512,
        tomodachi: true
    }, data, opts);

    opts.size -= opts.size % 64;
    if (opts.size < 64) opts.size = 64;

    await addWebGPUExtensions();

    const renderer = await createThreeRenderer();
    renderer.onDeviceLost = () => { };
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    var imageData = null;
    try {
        imageData = await renderRequestToImage(
            renderer,
            {
                data,
                fullBody: opts.fullBody,
                expression: opts.expression
            },
            opts
        );
    }
    finally {
        renderer.dispose();
        const device = renderer.backend.device;
        if (device instanceof GPUDevice) {
            await device.queue.onSubmittedWorkDone();
            device.destroy();
        }
    }
    return imageData;
}

async function renderForBrowser() {
    throw new Error("Tomodachi rendering requires Node.js access to romFS and CFL_Res.dat.");

}

var renderMii;
if (isNode) renderMii = renderForNode;
else renderMii = renderForBrowser;

export {
    renderMii,
    FFLExpression
};
