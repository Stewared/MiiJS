import jsQR from "jsqr";
import QRCodeStyling from "qr-code-styling";
import { Buffer } from "./platform.js";

import { decodeMii, encodeMii, detectMiiFormat } from "./miiProcess.js";
import { MiiFormats } from "./formats.js";
import { renderMii } from "./miiRendering.js";

const ONE_BY_ONE_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

function isWebp(buf) {
  return (
    Buffer.isBuffer(buf)
    && buf.length >= 12
    && buf.toString("ascii", 0, 4) === "RIFF"
    && buf.toString("ascii", 8, 12) === "WEBP"
  );
}

function clampByte(n) {
  if (n < 0) return 0;
  if (n > 255) return 255;
  return n | 0;
}

function toGrayscaleContrast(rgba, contrast = 1) {
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const lum = rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114;
    const adjusted = clampByte((lum - 128) * contrast + 128);
    out[i] = adjusted;
    out[i + 1] = adjusted;
    out[i + 2] = adjusted;
    out[i + 3] = 255;
  }
  return out;
}

function toBinaryThreshold(rgba, threshold = 128) {
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const lum = rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114;
    const value = lum < threshold ? 0 : 255;
    out[i] = value;
    out[i + 1] = value;
    out[i + 2] = value;
    out[i + 3] = 255;
  }
  return out;
}

function resizeNearest(rgba, width, height, scale) {
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));
  if (outWidth === width && outHeight === height) {
    return { width, height, rgba };
  }

  const out = new Uint8ClampedArray(outWidth * outHeight * 4);
  for (let y = 0; y < outHeight; y++) {
    const srcY = Math.min(height - 1, Math.floor(y / scale));
    for (let x = 0; x < outWidth; x++) {
      const srcX = Math.min(width - 1, Math.floor(x / scale));
      const srcI = (srcY * width + srcX) * 4;
      const outI = (y * outWidth + x) * 4;
      out[outI] = rgba[srcI];
      out[outI + 1] = rgba[srcI + 1];
      out[outI + 2] = rgba[srcI + 2];
      out[outI + 3] = rgba[srcI + 3];
    }
  }

  return { width: outWidth, height: outHeight, rgba: out };
}

function decodeWithJsQrVariants(rgba, width, height) {
  const variants = [];
  variants.push({ width, height, rgba });
  variants.push({ width, height, rgba: toGrayscaleContrast(rgba, 1.4) });
  variants.push({ width, height, rgba: toGrayscaleContrast(rgba, 1.9) });

  for (const threshold of [112, 128, 144]) {
    variants.push({ width, height, rgba: toBinaryThreshold(rgba, threshold) });
  }

  if (width * height <= 700 * 700) {
    const upscaled = resizeNearest(rgba, width, height, 2);
    variants.push(upscaled);
    variants.push({ width: upscaled.width, height: upscaled.height, rgba: toGrayscaleContrast(upscaled.rgba, 1.4) });
    variants.push({ width: upscaled.width, height: upscaled.height, rgba: toBinaryThreshold(upscaled.rgba, 128) });
  }

  const decodeOptions = [
    { inversionAttempts: "attemptBoth" },
    { inversionAttempts: "dontInvert" },
    { inversionAttempts: "onlyInvert" },
  ];

  for (const variant of variants) {
    for (const opts of decodeOptions) {
      let decoded = null;
      try {
        decoded = jsQR(variant.rgba, variant.width, variant.height, opts);
      } catch {
        continue;
      }
      if (decoded?.binaryData?.length > 0) return decoded;
    }
  }

  return null;
}

function bytesToLatin1String(bytes) {
  if (Buffer.isBuffer(bytes)) return bytes.toString("latin1");
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return s;
}

async function toUint8(input) {
  if (input == null) throw new TypeError("Expected image bytes or Blob");
  if (Buffer.isBuffer(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (isBrowser && input instanceof Blob) return new Uint8Array(await input.arrayBuffer());
  throw new TypeError("Unsupported input type");
}

// --- Browser image decode: bytes/blob -> { width, height, rgba(Uint8ClampedArray) } ---
async function decodeImageToRGBA_Browser(bytesOrBlob) {
  const blob = bytesOrBlob instanceof Blob ? bytesOrBlob : new Blob([await toUint8(bytesOrBlob)]);
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, rgba: imgData.data };
}

// --- Node image decode: keep your existing PNG/JPEG path but load deps dynamically ---
async function decodeImageToRGBA_Node(buf) {
  const [{ PNG }, jpeg, isPng, isJpg] = await Promise.all([
    import("pngjs"),
    import("jpeg-js"),
    import("is-png"),
    import("is-jpg"),
  ]);

  let width, height, rgba;
  if (isPng.default(buf)) {
    const png = PNG.sync.read(buf);
    width = png.width;
    height = png.height;
    rgba = png.data;
  } else if (isJpg.default(buf)) {
    const jpg = jpeg.default.decode(buf, { useTArray: true });
    width = jpg.width;
    height = jpg.height;
    rgba = jpg.data;
  } else if (isWebp(buf)) {
    try {
      const { createCanvas, loadImage } = await import("canvas");
      const img = await loadImage(buf);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      width = img.width;
      height = img.height;
      rgba = imgData.data;
    } catch {
      // Some canvas builds lack WEBP decode support; sharp provides a reliable fallback.
      const sharpMod = await import("sharp");
      const sharp = sharpMod.default;
      const raw = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      width = raw.info.width;
      height = raw.info.height;
      rgba = raw.data;
    }
  } else {
    throw new Error("Unsupported image format");
  }

  const data = new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength);
  return { width, height, rgba: data };
}

async function scanQR(input) {
  try {
    let decoded;
    if (isBrowser) {
      const { width, height, rgba } = await decodeImageToRGBA_Browser(input);
      decoded = decodeWithJsQrVariants(rgba, width, height);
    } else {
      const buf = Buffer.isBuffer(input) ? input : Buffer.from(await toUint8(input));
      const { width, height, rgba } = await decodeImageToRGBA_Node(buf);
      decoded = decodeWithJsQrVariants(rgba, width, height);
    }

    if (!decoded) throw new Error("QR code not found");
    return Buffer.from(decoded.binaryData);
  } catch (e) {
    return null;
  }
}

async function makeQR(input, opts = {}) {
  let {
    size = 512,
    margin = 0,
    prefix = "",
    encoding,
    overlayFrac = 0.3,
    qrOptions,
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions,
    image,
    noRenderMii = false,
    label
  } = opts;

  let isSpecial = false;
  if (input == null) throw new TypeError("makeQR(input): input is required");

  let dataStr = "";

  // Resolve input -> dataStr + overlay
  if (typeof input === "string") {
    dataStr = input;
  } else if (typeof input === "object" && input?.general?.hasOwnProperty("favoriteColor")) {
    const overlayPng = await renderMii(input, opts);
    image = Buffer.isBuffer(overlayPng) ? overlayPng : Buffer.from(overlayPng);

    if (!label && input?.meta?.name?.length > 0) label = input.meta.name;
    if (input?.meta?.type === "Special") isSpecial = true;

    const encoded = encodeMii(input, MiiFormats.FFED);
    dataStr = bytesToLatin1String(encoded);
  } else if (Buffer.isBuffer(input) || input instanceof Uint8Array) {
    if (!image && !noRenderMii && detectMiiFormat(input)?.length > 0) {
      try {
        const overlayPng = await renderMii(input, opts);
        image = Buffer.isBuffer(overlayPng) ? overlayPng : Buffer.from(overlayPng);
        const temp = decodeMii(input);
        if (!label && temp?.meta?.name?.length > 0) label = temp.meta.name;
        if (temp?.meta?.type === "Special") isSpecial = true;
      } catch (e) {
        console.log(e);
        image = null;
      }
    }
    dataStr = bytesToLatin1String(input);
  } else {
    throw new TypeError("input must be string | Buffer | Uint8Array | Mii JSON");
  }

  if (encoding && typeof input !== "string") {
    dataStr = encoding === "latin1"
      ? bytesToLatin1String(input)
      : Buffer.from(input).toString(encoding);
  }
  if (prefix) dataStr = prefix + dataStr;

  const hasOverlay = !!image;

  // Build QRCodeStyling config. Node needs jsdom/nodeCanvas; browser must omit them.
  const baseConfig = {
    type: "canvas",
    data: dataStr,
    width: size,
    height: size,
    margin,

    dotsOptions: { color: "#000000", type: "square", ...(dotsOptions ?? {}) },
    backgroundOptions: { color: "#ffffff", ...(backgroundOptions ?? {}) },

    image: hasOverlay ? ONE_BY_ONE_GIF : undefined,
    imageOptions: {
      saveAsBlob: false,
      hideBackgroundDots: hasOverlay,
      imageSize: 0.4,
      crossOrigin: "anonymous",
      margin: 0,
    },

    qrOptions: { errorCorrectionLevel: "H", ...(qrOptions ?? {}) },

    ...(cornersSquareOptions ? { cornersSquareOptions: { ...cornersSquareOptions } } : {}),
    ...(cornersDotOptions ? { cornersDotOptions: { ...cornersDotOptions } } : {}),
  };

  if (!isBrowser) {
    const { JSDOM } = await import("jsdom");
    const nodeCanvas = await import("canvas");
    baseConfig.jsdom = JSDOM;
    baseConfig.nodeCanvas = nodeCanvas;
  }

  const qr = new QRCodeStyling(baseConfig);

  // Get QR PNG bytes
  let qrBytes;
  if (isBrowser) {
    const blob = await qr.getRawData("png");       // Blob in browser
    qrBytes = new Uint8Array(await blob.arrayBuffer());
  } else {
    qrBytes = Buffer.from(await qr.getRawData("png")); // Buffer-ish in node
  }

  if (!hasOverlay) return Buffer.from(qrBytes);

  // Composite overlay onto QR in current environment
  if (isBrowser) {
    // Browser canvas compositing
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const qrBmp = await createImageBitmap(new Blob([qrBytes], { type: "image/png" }));
    ctx.drawImage(qrBmp, 0, 0, size, size);

    const overlayBlob = image instanceof Blob ? image : new Blob([await toUint8(image)], { type: "image/png" });
    const overlayBmp = await createImageBitmap(overlayBlob);

    const box = Math.floor(size * overlayFrac);
    const x = Math.floor((size - box) / 2);
    const y = Math.floor((size - box) / 2);

    const scale = Math.min(box / overlayBmp.width, box / overlayBmp.height);
    const w = Math.floor(overlayBmp.width * scale);
    const h = Math.floor(overlayBmp.height * scale);
    const ox = x + Math.floor((box - w) / 2);
    const oy = y + Math.floor((box - h) / 2);

    const fontSize = Math.max(12, Math.floor(box * 0.12));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const textX = x + box / 2;
    const textY = oy;
    ctx.fillStyle = "#000000";
    if (label) ctx.fillText(label, textX, textY);

    ctx.drawImage(overlayBmp, ox, oy, w, h);

    if (isSpecial) {
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 5;
      ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, box - ctx.lineWidth, box - ctx.lineWidth);
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);
    }

    const outBlob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    return Buffer.from(new Uint8Array(await outBlob.arrayBuffer()));
  } else {
    // Node canvas compositing (your original logic)
    const nodeCanvas = await import("canvas");
    const { createCanvas, loadImage } = nodeCanvas;

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    const qrImg = await loadImage(Buffer.from(qrBytes));
    ctx.drawImage(qrImg, 0, 0, size, size);

    const overlayImg = await loadImage(image);

    const box = Math.floor(size * overlayFrac);
    const x = Math.floor((size - box) / 2);
    const y = Math.floor((size - box) / 2);

    const scale = Math.min(box / overlayImg.width, box / overlayImg.height);
    const w = Math.floor(overlayImg.width * scale);
    const h = Math.floor(overlayImg.height * scale);
    const ox = x + Math.floor((box - w) / 2);
    const oy = y + Math.floor((box - h) / 2);

    const fontSize = Math.max(12, Math.floor(box * 0.12));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const textX = x + box / 2;
    const textY = oy;

    ctx.fillStyle = "#000000";
    if (label) ctx.fillText(label, textX, textY);

    if (image) ctx.drawImage(overlayImg, ox, oy, w, h);

    if (isSpecial) {
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 5;
      ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, box - ctx.lineWidth, box - ctx.lineWidth);
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);
    }

    return canvas.toBuffer("image/png");
  }
}

export { scanQR, makeQR };
