import * as fs from 'fs';
let THREE;
import { GLTFLoader, SkeletonUtils } from 'three/examples/jsm/Addons.js';
const BGRA8Unorm = 'bgra8unorm';

import * as processMii from './miiProcess.js';
import { MiiFormats } from './formats.js';
import { normalizeGlassesTypeFor3DSRender } from "./renderNormalization.js";

import { isNode } from './platform.js';

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

//All of this is for FFL
import { addSkeletonScalingExtensions } from 'ffl.js/helpers/SkeletonScalingExtensions.js';
import { detectModelDesc } from 'ffl.js/helpers/ModelScaleDesc.js';

let webgpuPromise;
async function getWebGPU() {
    if (!webgpuPromise) {
        webgpuPromise = import('webgpu');
    }
    return webgpuPromise;
}

// Imported from: https://github.com/ariankordi/FFL.js/blob/ae0a482abdbd9f81d4e12b055317c12a8a1783a4/helpers/HeadlessWebGPU.js

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
        userAgent: obj.navigator?.userAgent ?? '' // THREE.GLTFLoader accesses this.
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
import { prepareBodyForCharModel, attachHeadToBody, disposeModel, adjustCameraForBodyHead, getFaceCamera, getWholeBodyCamera } from 'ffl.js/helpers/BodyUtilities.js';
import { FFL, CharModel, pantsColors, FFLExpression } from 'ffl.js';
import FFLShaderNodeMaterial from 'ffl.js/materials/FFLShaderNodeMaterial.js';
import FFLShaderMaterial from 'ffl.js/materials/FFLShaderMaterial.js';
import imported from 'ffl.js/examples/ffl-emscripten-single-file.cjs';
let ModuleFFL;
if (isNode) ModuleFFL = imported?.ModuleFFL ?? imported?.default ?? imported;
else ModuleFFL = globalThis.ModuleFFL;

// Some body model functions are from: https://github.com/ariankordi/my-jsfiddles/blob/main/threejs-mii-accurate-body-scaling/script.js
async function loadGLTFFromFS(path) {
    if (!fs.existsSync(path)) return null;
    const content = await fs.promises.readFile(path);
    // Buffer can be larger than the view, so slice to the actual bytes we read.
    const ab = content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
    return new Promise((resolve, reject) => {
        new GLTFLoader().parse(
            ab,
            '', // basePath; empty is fine for embedded/binary glb
            resolve,
            reject
        );
    });
}
async function loadFirstGLTFFromFS(paths) {
    for (const path of paths) {
        const gltf = await loadGLTFFromFS(path);
        if (gltf) return gltf;
    }
    return null;
}
async function loadGLTFFromURL(url) {
    const res = await fetch(url);
    if (!res.ok) return null;

    const ab = await res.arrayBuffer();
    return new Promise((resolve, reject) => {
        new GLTFLoader().parse(
            ab,
            '', // basePath not needed for .glb
            resolve,
            reject
        );
    });
}


var _fflRes;
var bodyTemplates;
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
        //Automatically use FFL Resource if we can locate it anywhere we'd expect it to be
        const searchFolders = [".", "..", "./ffl", "./afl", "./resources", "./FFL", "./AFL", "./Resources", "./node_modules/miijs"];
        const searchNames = ["fflreshigh", "aflreshigh", "FFLResHigh", "AFLResHigh", "AFLResHigh_2_3", "aflreshigh_2_3"];
        const searchSuffixes = ["dat", "bin"];
        let breakNow = false;
        for (const folder of searchFolders) {
            for (const name of searchNames) {
                for (const suffix of searchSuffixes) {
                    if (fs.existsSync(`${folder}/${name}.${suffix}`)) {
                        _fflRes = await fs.promises.readFile(`${folder}/${name}.${suffix}`);
                        breakNow = true;
                        break;
                    }
                }
                if (breakNow) break;
            }
            if (breakNow) break;
        }
    }

    if (isNode) {
        bodyTemplates = [
            await loadFirstGLTFFromFS([
                "./miiMaleBody.glb",
                "../miiMaleBody.glb",
                "./node_modules/miijs/miiMaleBody.glb",
                "../node_modules/miijs/miiMaleBody.glb"
            ]),
            await loadFirstGLTFFromFS([
                "./miiFemaleBody.glb",
                "../miiFemaleBody.glb",
                "./node_modules/miijs/miiFemaleBody.glb",
                "../node_modules/miijs/miiFemaleBody.glb"
            ])
        ];
    }
    else {
        bodyTemplates = [
            await loadGLTFFromURL("./miiMaleBody.glb"),
            await loadGLTFFromURL("./miiFemaleBody.glb")
        ];
    }
})();

function loadBodyModel(gender) {
    const gltf = bodyTemplates?.[gender];
    if (!gltf || !gltf.scene) {
        return null;
    }

    try {
        const model = SkeletonUtils.clone(gltf.scene);
        const animations = gltf.animations ?? [];
        const mixer = new THREE.AnimationMixer(model);

        if (animations.length) {
            let clip = animations.find(a => a.name === 'Wait') || animations[0];
            mixer.clipAction(clip).play().setLoop(THREE.LoopRepeat, Infinity);
        }

        return { model, animations, mixer, scaleDesc: detectModelDesc(model) };
    }
    catch(e) {
        return null;
    }
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

async function renderRequestToImage(renderer, ffl, request, opts = {}) {
    // Based on: https://github.com/ariankordi/FFL.js/blob/ae0a482abdbd9f81d4e12b055317c12a8a1783a4/examples/nodejs-icon-body-webgpu.js#L168
    const scene = new THREE.Scene();
    let charModel = null;
    let body = null;

    // Square output size (defaults to 256)
    const SIZE = Number.isFinite(opts.size) ? Math.max(1, Math.floor(opts.size)) : 256;

    try {
        charModel = new CharModel(ffl, request.data, request.expression, FFLShaderNodeMaterial, renderer);

        charModel.meshes.traverse((m) => {
            m.frustumCulled = false;
        });

        // Keep your existing "map -> sRGB" tweak (safe/minimal).
        // Note: this won't fix the monochrome issue by itself, but it doesn't hurt.
        charModel.meshes.traverse((m) => {
            if (m.material?.map) {
                m.material.map.colorSpace = THREE.SRGBColorSpace;
                m.material.needsUpdate = true;
            }
        });

        // after: charModel = new CharModel(...)
        scene.add(charModel.meshes); // <-- ALWAYS render head at minimum
        if(!opts.bodyPath){
            body = loadBodyModel(charModel.charInfo.gender);
        }
        else{
            bodyTemplates[2]=await loadGLTFFromFS(opts.bodyPath);
            body=loadBodyModel(2);
        }

        if (body) {
            try {
                body.mixer.update(0);

                prepareBodyForCharModel(
                    body,
                    FFLShaderNodeMaterial,
                    charModel.favoriteColor,
                    charModel.getBodyScale(),
                    pantsColors[request.pantsColor].clone().convertLinearToSRGB()
                );

                attachHeadToBody(body, charModel.meshes);

                // head will get re-parented under the body, so add the body to scene too
                scene.add(body.model);
            }
            catch (e) {
                // If anything body-related fails, keep head-only rendering
                body = null;
            }
        }



        let camera;
        if (request.fullBody && body) {
            camera = getWholeBodyCamera(1, charModel.charInfo.height);
        }
        else {
            camera = getFaceCamera();
            if (body) {
                adjustCameraForBodyHead(camera, body);
            }
            else {
                levelFaceCameraToObject(camera, charModel.meshes);
            }
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
        charModel && charModel.dispose();
        if (body) {
            disposeModel(body.model);
            body.mixer.uncacheRoot(body.model);
        }
    }
}

function bytesToHex(bytes) {
    let hex = "";
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
}

async function imageResponseToBytes(res) {
    if (!res.ok) {
        throw new Error(`Mii Studio render failed: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return (typeof Buffer !== "undefined") ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer);
}

async function renderWithStudio(data, fullBody = false) {
    data = structuredClone(await processMii.decodeMii(data));
    data = processMii.encodeMii(data, MiiFormats.EMNMS);
    const url=`https://studio.mii.nintendo.com/miis/image.png?data=${bytesToHex(data)}${fullBody?`&type=all_body`:``}&width=512&instanceCount=1`;
    return await imageResponseToBytes(await fetch(url));
}

async function renderForNode(data, opts = {}) {
    await isInitialised;
    //We need some info from the buffer, and we also need to make sure it's in MNMS
    data = await normalizeDecodedMiiForRender(data);

    var pantsColor = 0;
    if (data?.meta?.type?.toLowerCase() === "special") {
        pantsColor = 3;
    }
    else if (data?.perms?.favorited) {
        pantsColor = 2;
    }
    else if (data?.meta?.type?.toLowerCase() === "foreign") {
        pantsColor = 1;
    }

    // Add size default here so it’s available to renderRequestToImage
    opts = Object.assign({
        fullBody: false,
        expression: 0,
        size: 512
    }, data, opts);

    opts.size -= opts.size % 64;
    if (opts.size < 64) opts.size = 64;

    data = processMii.encodeMii(data, MiiFormats.MNMS);

    var resourceFile;
    if (opts.fflResBuffer) {//Prefer the direct buffer
        resourceFile = opts.fflResBuffer;
    }
    else if (opts.fflResPath) {//Use the path if they provided it
        resourceFile = await fs.promises.readFile(opts.fflResPath);
        if (!resourceFile) {
            try {
                resourceFile = await fetch(opts.fflResPath);
                resourceFile = await resourceFile.blob();
                resourceFile = Buffer.from(resourceFile);
            }
            catch{}
        }
    }
    else if (_fflRes) {//See if it's in the root directory and use it automatically if we can
        resourceFile = _fflRes;
    }
    else {//No FFL Resource, no textures or models to render with.
        console.warn(`FFL Resource is unavailable. See README.md for more information.`);
        return await renderWithStudio(data, opts.fullBody);
    }

    addSkeletonScalingExtensions(THREE.Skeleton);
    await addWebGPUExtensions();

    const renderer = await createThreeRenderer();
    renderer.onDeviceLost = () => { };
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    let ffl = null;
    var imageData = null;
    try {
        ffl = await FFL.initWithResource(resourceFile, ffl?.module ?? ModuleFFL);
        ffl.setRenderer(renderer);

        imageData = await renderRequestToImage(
            renderer,
            ffl,
            {
                data,
                pantsColor,
                fullBody: opts.fullBody,
                expression: opts.expression
            },
            opts
        );
    }
    finally {
        (ffl) && ffl.dispose();
        renderer.dispose();
        const device = renderer.backend.device;
        if (device instanceof GPUDevice) {
            await device.queue.onSubmittedWorkDone();
            device.destroy();
        }
    }
    return imageData;
}

async function renderForBrowser(data, opts = {}) {
    await isInitialised;

    data = await normalizeDecodedMiiForRender(data);

    var pantsColor = 0;
    if (data?.meta?.type?.toLowerCase() === "special") {
        pantsColor = 3;
    }
    else if (data?.perms?.favorited) {
        pantsColor = 2;
    }
    else if (data?.meta?.type?.toLowerCase() === "foreign") {
        pantsColor = 1;
    }

    // Add size default here so it’s available to renderRequestToImage
    opts = Object.assign({
        fullBody: false,
        expression: 0,
        size: 512
    }, data, opts);

    opts.size -= opts.size % 64;
    if (opts.size < 64) opts.size = 64;

    data = processMii.encodeMii(data, MiiFormats.MNMS);

    // Load resource as Uint8Array (avoid Buffer in browser)
    let resourceFile;

    if (opts.fflResBuffer) {
        resourceFile = opts.fflResBuffer;
    }
    else if (opts.fflResPath) {
        const res = await fetch(opts.fflResPath);
        resourceFile = new Uint8Array(await res.arrayBuffer());
    }
    else if (_fflRes) {
        // If this is a Node Buffer, convert
        resourceFile = _fflRes instanceof Uint8Array ? _fflRes : new Uint8Array(_fflRes);
    }
    else {
        console.warn(`FFL Resource is unavailable. See README.md for more information.`);
        return await renderWithStudio(data, opts.fullBody);
    }
    const ffl = await FFL.initWithResource(resourceFile, ModuleFFL);

    // Create scene.
    addSkeletonScalingExtensions(THREE.Skeleton);

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(opts.size, opts.size, false);

    ffl.setRenderer(renderer);

    // Head model
    let currentCharModel = new CharModel(ffl, data, opts.expression, FFLShaderMaterial, renderer);
    currentCharModel.meshes.traverse(m => { m.frustumCulled = false; });
    let body;
    if(!opts.bodyPath){
        body = loadBodyModel(currentCharModel.charInfo.gender);
    }
    else{
        bodyTemplates[2]=await loadGLTFFromFS(opts.bodyPath);
        body=loadBodyModel(2);
    }

    if (body) {
        body.mixer.update(0);

        prepareBodyForCharModel(
            body,
            FFLShaderMaterial,
            currentCharModel.favoriteColor,
            currentCharModel.getBodyScale(),
            pantsColors[pantsColor].clone().convertLinearToSRGB()
        );

        attachHeadToBody(body, currentCharModel.meshes);
        scene.add(body.model);
    }
    else {
        scene.add(currentCharModel.meshes);
    }

    let camera;
    if (opts.fullBody && body) {
        camera = getWholeBodyCamera(1, currentCharModel.charInfo.height);
    }
    else {
        camera = getFaceCamera();
        if (body) {
            adjustCameraForBodyHead(camera, body);
        }
        else {
            levelFaceCameraToObject(camera, currentCharModel.meshes);
        }
    }

    renderer.render(scene, camera);


    // Ensure GPU finished
    const gl = renderer.getContext();
    gl.finish();

    // Convert canvas -> PNG bytes
    const blob = await new Promise(resolve =>
        renderer.domElement.toBlob(resolve, "image/png")
    );

    const arrayBuffer = await blob.arrayBuffer();

    // Return Buffer in Node, Uint8Array in browser
    return (typeof Buffer !== "undefined") ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer);
}

var renderMii;
if (isNode) renderMii = renderForNode;
else renderMii = renderForBrowser;

export {
    renderMii,
    FFLExpression
};
