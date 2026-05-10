const esbuild = require('esbuild');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const browserZipFiles = [
  {
    source: './node_modules/ffl.js/ffl-emscripten.cjs',
    zipName: 'fflModule.cjs'
  },
  { source: './node_modules/ffl.js/ffl-emscripten.wasm' },
  { source: './miiMaleBody.glb' },
  { source: './miiFemaleBody.glb' },
  { source: './dist/miijs.browser.esm.js' },
  { source: './dist/miijs.browser.esm.js.map' },
  { source: './dist/miijs.browser.js' },
  { source: './dist/miijs.browser.js.map' },
  { source: './README.md' },
  { source: './silhouette0.png' },
  { source: './silhouette1.png' }
];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date) {
  const safeYear = Math.max(date.getFullYear(), 1980);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const dosTime =
    ((hours & 0x1f) << 11) |
    ((minutes & 0x3f) << 5) |
    (Math.floor(seconds / 2) & 0x1f);

  const dosDate =
    (((safeYear - 1980) & 0x7f) << 9) |
    ((month & 0x0f) << 5) |
    (day & 0x1f);

  return { dosTime, dosDate };
}

function createZip(entries, outputPath) {
  const localFileParts = [];
  const centralDirectoryParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8');
    const dataBuffer = entry.data;
    const crc = crc32(dataBuffer);
    const { dosTime, dosDate } = toDosDateTime(entry.mtime);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const localFileRecord = Buffer.concat([localHeader, nameBuffer, dataBuffer]);
    localFileParts.push(localFileRecord);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralDirectoryParts.push(Buffer.concat([centralHeader, nameBuffer]));
    offset += localFileRecord.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralDirectoryParts.reduce(
    (total, part) => total + part.length,
    0
  );
  const entryCount = entries.length;

  const endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(entryCount, 8);
  endOfCentralDirectory.writeUInt16LE(entryCount, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectorySize, 12);
  endOfCentralDirectory.writeUInt32LE(centralDirectoryOffset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  const zipBuffer = Buffer.concat([
    ...localFileParts,
    ...centralDirectoryParts,
    endOfCentralDirectory
  ]);

  fs.writeFileSync(outputPath, zipBuffer);
}

function createBrowserBuildZip() {
  const zipOutputPath = path.resolve(__dirname, './browserBuild.zip');
  const entries = browserZipFiles.map(({ source, fallbackSource, zipName }) => {
    const primaryPath = path.resolve(__dirname, source);
    const fallbackPath = fallbackSource ? path.resolve(__dirname, fallbackSource) : null;
    const sourcePath = fs.existsSync(primaryPath)
      ? primaryPath
      : fallbackPath && fs.existsSync(fallbackPath)
        ? fallbackPath
        : null;

    if (!sourcePath) {
      throw new Error(`Cannot create browserBuild.zip: missing file ${source}`);
    }

    return {
      name: zipName || path.basename(source),
      data: fs.readFileSync(sourcePath),
      mtime: fs.statSync(sourcePath).mtime
    };
  });

  createZip(entries, zipOutputPath);
}

const isServe = process.argv.includes('--serve');
const port = 8080;

// Plugin to replace Node.js-only modules with stubs
const nodeShimPlugin = {
  name: "node-shim",
  setup(build) {
    const shim = (p) => ({ path: path.resolve(__dirname, p) });

    // Replace ./platform.js with browser shim
    build.onResolve({ filter: /^\.\/platform\.js$/ }, (args) => ({
      path: path.join(args.resolveDir, "shims/platform.browser.js"),
    }));

    // Core node builtins -> browser shims/polyfills
    build.onResolve({ filter: /^(node:)?fs$/ }, () => shim("shims/fs.browser.js"));
    build.onResolve({ filter: /^path$/ }, () => ({ path: require.resolve("path-browserify") }));
    build.onResolve({ filter: /^node:path$/ }, () => ({ path: require.resolve("path-browserify") }));
    build.onResolve({ filter: /^(node:)?util$/ }, () => ({ path: require.resolve("util/") }));

    build.onResolve({ filter: /^stream$/ }, () => ({ path: require.resolve("stream-browserify") }));
    build.onResolve({ filter: /^events$/ }, () => ({ path: require.resolve("events/") }));
    build.onResolve({ filter: /^assert$/ }, () => ({ path: require.resolve("assert/") }));
    build.onResolve({ filter: /^util$/ }, () => ({ path: require.resolve("util/") }));
    build.onResolve({ filter: /^buffer$/ }, () => ({ path: require.resolve("buffer/") }));
    build.onResolve({ filter: /^(node:)?crypto$/ }, () => shim("shims/crypto.browser.js"));
    build.onResolve({ filter: /^zlib$/ }, () => ({ path: require.resolve("browserify-zlib") }));


    // Anything that should never be bundled for browser:
    for (const mod of ["jsdom","canvas","pngjs","jpeg-js","is-png","is-jpg","sharp","webgpu","fetch"]) {
      build.onResolve({ filter: new RegExp(`^${mod}$`) }, () => shim("shims/empty.js"));
    }

    // If you still reference the old FFL emscripten CJS file:
    build.onResolve(
      { filter: /ffl\.js\/examples\/ffl-emscripten-single-file\.cjs$/ },
      () => shim("shims/empty.js")
    );
  }
};



//Build configuration for browser bundle
const buildOptions = {
    entryPoints: ['./index.js'],
    bundle: true,
    globalName: 'MiiJS',
    outfile: './dist/miijs.browser.js',
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    sourcemap: true,
    minify: !isServe,
    define: {
        'process.versions': 'undefined',
        '__MIIJS_BUNDLE_URL__': 'import.meta.url',
    },
    plugins: [nodeShimPlugin],
    loader: {
        '.json': 'json'
    },
    inject: [path.resolve(__dirname, "shims/globals.browser.js")],
    external: ["jsdom", "canvas", "pngjs", "jpeg-js", "is-png", "is-jpg"]
};
// Also build an ESM version
const esmBuildOptions = {
    ...buildOptions,
    outfile: './dist/miijs.browser.esm.js',
    format: 'esm',
    globalName: undefined
};

//Build config for CJS exports
const nodeCjsBuildOptions = {
  entryPoints: ["./index.js"],
  bundle: true,
  outfile: "./dist/miijs.cjs",
  format: "cjs",
  platform: "node",
  target: ["node20"],
  sourcemap: true,
  minify: !isServe,
  define: {
    '__MIIJS_BUNDLE_URL__': '""'
  },
  external:["canvas","jsdom","webgpu"],
  footer: {
    js: "if (module.exports && module.exports.default) { module.exports = module.exports.default; module.exports.default = module.exports; }"
  }
};

async function build() {
    try {
        // Create dist directory if it doesn't exist
        if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist');
        }

        // Build IIFE version
        await esbuild.build(buildOptions);
        console.log('✓ Built dist/miijs.browser.js (IIFE)');

        // Build ESM version
        await esbuild.build(esmBuildOptions);
        console.log('✓ Built dist/miijs.browser.esm.js (ESM)');

        // Build Node CJS version
        await esbuild.build(nodeCjsBuildOptions);
        console.log("✓ Built dist/miijs.cjs (Node CJS)");

        // Package browser release files as a flat zip
        createBrowserBuildZip();
        console.log('Built browserBuild.zip');

        console.log('Build complete!');

    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

async function serve() {
    try {
        // Create dist directory
        if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist');
        }

        // Start esbuild in watch mode
        const ctx = await esbuild.context({
            ...buildOptions,
            minify: false,
        });
        await ctx.watch();
        console.log('✓ Watching for changes...');

        // Also build ESM version
        const ctxEsm = await esbuild.context({
            ...esmBuildOptions,
            minify: false,
        });
        await ctxEsm.watch();

        // Create a simple HTTP server
        const server = http.createServer((req, res) => {
            let filePath = req.url === '/' ? '/webpage-example/index.html' : req.url;
            filePath = path.join(__dirname, filePath);

            // Get file extension
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.mii': 'application/octet-stream',
            };

            const contentType = mimeTypes[ext] || 'application/octet-stream';

            fs.readFile(filePath, (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        res.writeHead(404);
                        res.end('File not found: ' + req.url);
                    } else {
                        res.writeHead(500);
                        res.end('Server error: ' + error.code);
                    }
                } else {
                    res.writeHead(200, { 
                        'Content-Type': contentType,
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(content, 'utf-8');
                }
            });
        });

        server.listen(port, () => {
            console.log(`\n🚀 Dev server running at http://localhost:${port}`);
            console.log(`   Open http://localhost:${port} to view the example\n`);
        });

    } catch (error) {
        console.error('Serve failed:', error);
        process.exit(1);
    }
}

if (isServe) {
    serve();
} else {
    build();
}
