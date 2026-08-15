# MiiJS
MiiJS is a comprehensive JavaScript library for reading, writing, converting, and rendering Nintendo Mii data.
Supports Wii, DS, 3DS, Wii U, Switch, Switch 2, Amiibo, Tomodachi Life, Miitomo, QR Codes, Studio Codes, Special Miis, and virtually every known Mii format.
Build once, work with Miis from any console.

Powers [https://infinimii.com/](InfiniMii), a website that lets you do everything MiiJS does from a GUI.

*Rendering uses Tomodachi Life RomFS body/headwear assets plus `CFL_Res.dat`.*
## Installation
MiiJS works in both browser and Node.js, and in both ESM and CJS.

### Node
`npm install miijs` || `npm i miijs`

- `import MiiJS from "miijs";`
- `import {Mii} from "miijs";`
- `const MiiJS = require("miijs");`
- `const {Mii} = require("miijs");`

### Browser
Download the latest release zip and serve it unzipped however you like, replace the paths with your relevant path.
```html
<script type="module">
    import MiiJS from "./miijs.browser.js"; //miijs.browser.esm.js available as well
    //Code to interact with MiiJS
</script>
```

### Building
You only need to build if developing local changes for CJS and/or the Browser, in which case just run `npm run build`.

## Example Usage
```js
import fs from "fs";
import {Mii, ConsoleFormats, MiiFormats, makeMiiChild, kidomatic, miiHeightToMeasurements, miiWeightToMeasurements, imperialHeightWeightToMiiWeight, centimetersToMiiHeight} from "miijs";

//Manipulation
let JohnDoe = await Mii.create("./JohnDoe.charinfo");//Initialize JohnDoe.charinfo from the FS into the Mii class
JohnDoe.fields.meta.type="Special";//Modify fields as necessary
JohnDoe.set("name","Johnny");//Modify fields by friendly human name
JohnDoe.set({meta:{creatorName:"John Sr."}});//Modify fields by an object
await JohnDoe.setAs(ConsoleFormats["3DS"],"hair.type",[9,1,2]);//Set the hairstyle to the one that is, if you were on 3DS (or Wii U), on the 9th page, 1 from the left, 2 from the top. For non paginated values, only two values are necessary. Friendly human names also available.
await JohnDoe.getAs(ConsoleFormats.WII,"hair.type");//Return the friendly name as if viewing from a Wii, same as setAs. Friendly human names also available.

//Writing
fs.writeFileSync("./JohnDoe.rsd", JohnDoe.encode(MiiFormats.RSD));//Backport and write a Wii file for use on Wiimotes (.mii is the widely known name, but not advised for use)
fs.writeFileSync("./John.json",JSON.stringify(JohnDoe.toJSON(),null,4));//Write the representation of fields MiiJS is using for JohnDoe to a JSON file
console.log(JohnDoe);//Mii.toString() will automatically encode as an MNMS/Studio Code string, you can call JohnDoe.toString(MiiFormats.FORMAT) to get a hex string for a different format
const JohnImg = await JohnDoe.render();//Return a buffer containing an image of the Mii
fs.writeFileSync(`./JohnnysFace.png`,JohnImg);
const JohnQR = await JohnDoe.toQR();//Return a buffer containing an image of the Mii QR.
fs.writeFileSync(`./JohhnysQR.png`,JohnQR);

//Instruction Generation
const instrs=await JohnDoe.toInstructions(ConsoleFormats.DS);//Make a JSON object of the Mii, with human friendly instructions to recreate on that console, backporting if necessary (DS editor in this case is treated as Tomodachi Collection)
console.log(instrs.hair.type);//Human friendly text for how to find the hair type, in this case, on the DS editor
fs.writeFileSync("./JohnInstrs.txt",JSON.stringify(instrs,null,4));//Write a file with the JSON instructions
fs.writeFileSync("./JohnInstrs.json",JSON.stringify(instrs,null,4));

//Amiibo Manipulation
let exampleAmiibo = fs.readFileSync("./Amiibo.ntag");
let miiOnAmiibo = await Mii.create(exampleAmiibo);//Automatically detect as Amiibo and extract Mii from it
exampleAmiibo = await JohnDoe.insertIntoAmiibo(exampleAmiibo);//Insert into the Amiibo, return the buffer
fs.writeFileSync(`./JohnOnAmiibo.ntag`,exampleAmiibo);//Write a new Amiibo file back

//Other Functions
//Kidomatic
const kidStages = await kidomatic(JohnDoe);//Returns an array with six stages of life represented as raw JSON for the provided Mii.
let toddlerJohn = await Mii.create(kidStages[1]);
console.log(toddlerJohn.fields.meta.name);

//Baby
const child = await makeMiiChild(miiOnAmiibo, JohnDoe);//Returns an array with six stages of life represented as raw JSON for the generated baby.
let newborn = await Mii.create(child[0]);
let fullGrown = await Mii.create(child[5]);
console.log(fullGrown.fields.meta.name);

// Height/Weight Conversion
console.log((await miiHeightToMeasurements(JohnDoe.fields.general.height)).totalInches);//Returns a JSON object with various human measurements (imperial, metric) converted from Mii measurements
console.log((await miiWeightToMeasurements(JohnDoe.fields.general.height)).pounds);
JohnDoe.set("weight", await imperialHeightWeightToMiiWeight(70, 150));//Set JohnDoe's Weight to a good Mii weight for a person who's 5'10" (70 inches), and 150lbs (metric version also available).
JohnDoe.set("height", await centimetersToMiiHeight(175));//Set JohnDoe's Height to a good Mii height for a person who's 175cm (imperial version also available).
```

### Enums
- MiiFormats | An enum of all available Mii Formats to decode and encode to
- ConsoleFormats | An enum of all available console types for functions that need a specific console (getAs/setAs, instructions)
- FFLExpression | Legacy expression enum retained for API compatibility. Tomodachi rendering currently uses the normal CFL face texture layout.
- FavoriteColors | An array of favorite color human names to Mii favoriteColor ID

## Full Function/Variable List
Path can be either "meta.name", or just "name" in all cases. "hairType", or "hair.type". For a full list of possible friendly names, run `Object.keys(mappings).filter(a=>mappings[a]!=="SKIP").join(", ")` (I'd put the output here but it's massive and this README is already massive)
Console will be one of ConsoleFormats in all cases.
Format will be one of MiiFormats in all cases.
Debug values enable extra logging to help figure out why something is breaking and where
- Mii
    - new Mii(anyKnownWayToRepresentAMii) | No URL or file paths can be searched with this method, otherwise parallel to Mii.create
    - async Mii.create(anyKnownWayToRepresentAMii) | Automatically detect Mii format from basically any valid Mii, and read it into a Mii object
    - Mii.toString(format) | Same as Mii.encode, but returns a hex string
    - Mii.toBuffer(format) | Same as Mii.encode, for automatic encoding with some functions, Mii.encode encouraged
    - Mii.toJSON() | Returns Mii.fields
    - Mii.set(objOrPath, value) | Mii.set({meta:{name:"RickAstley"}}), and Mii.set("name", "RickAstley"), and Mii.set("meta.name", "RickAstley") will all do the same thing
    - Mii.get(path) | Returns the value
    - async Mii.setAs(console, path, value) | Set as if selecting an item on that console's Mii Maker, value is [page, countFromTheLeft, countFromTheTop], or [countFromTheLeft, countFromTheTop]
    - async Mii.getAs(console, path) | Get the value as if seeing the item on that console's Mii Maker, see setAs for what value returns
    - Mii.encode(format) | Encodes the Mii to that binary format. Returns a Promise only for optional async encoders such as encrypted QR formats.
    - async Mii.toQR(options) | Returns a buffer containing a QR code for that Mii, scannable by the 3DS or Wii U. Renders the Mii as an icon for the QR when Tomodachi RomFS assets and CFL_Res.dat are available.
        - Options values include, size: resolution, image: icon to use, noRenderMii: set to true to not render the Mii icon, label: label text to use instead of the Mii name. Additional passthrough options from [qr-code-styling](https://github.com/kozakdenys/qr-code-styling): qrOptions, dotsOptions, cornersSquareOptions, cornersDotsOptions, backgroundOptions. See Mii.render for more available options.
    - async Mii.render(fullBodyRender, options) | Returns a buffer containing a Tomodachi-style render of that Mii.
        - Options values include, fullBody: Render the full body of the Mii instead of just the head, expression: FFLExpression, size: size of the image, tomodachiRomfs: path to a Tomodachi `romFS` folder, cflResPath: path to CFL_Res.dat.
    - async Mii.insertIntoAmiibo(amiiboDump) | Provide a buffer containing the Amiibo exactly as it is on the tag, this function returns the same Amiibo with your Mii inserted
    - async Mii.toInstructions(console) | Provides a JSON object containing human readable sentences and directions to recreate the Mii on that console
- async insertMiiIntoAmiibo(amiiboDump, mii) | See Mii.insertIntoAmiibo
- async extractMiiFromAmiibo(amiiboDump) | Returns the Mii binary from inside the Amiibo, can then be decoded using any of the provided decode functions
- MiiFormats | See enums
- ConsoleFormats | See enums
- mappings | The mappings for friendly name to JSON path
- defaultMappings | The default values we use if you encode a Mii to a format that needs a field the format it's coming from didn't have
- async makeMiiChild(mii1, mii2, options) | Provide two Miis to this function, this function presents an array of six JSON objects representing a potential child at all stages of life in the style of Tomodachi Life
    - Options values include, name: Mii name to result in, creatorName: Output creatorName result, gender: Gender of the child (0 Male, 1 Female, same as in the Mii code that all Miis output), favoriteColor: The output child's favorite color
- async kidomatic(mii, hairGroupIndex) | Provide one Mii to this function, this function presents an array of six JSON objects representing that Mii at all stages of childhood in the style of Tomodachi Life
    - hairGroupIndex is optional, and recommended to omit without a specific usecase. If omitted or negative, kidomatic will infer an appropriate child hairstyle group from the Mii's current hair type and gender.
- async decryptMii(miiBuffer) | Decrypts the Mii from the QR code format
- async encryptMii(miiBuffer) | Encrypts the Mii to the QR code format
- async makeInstructions(mii, console) | See Mii.toInstructions
- async getAs(mii, console, path) | See Mii.getAs
- async setAs(mii, console, path, value) | See Mii.setAs
- async miiHeightToMeasurements(miiHeight) | Input a Mii's height (from 0-127), outputs { totalInches, inches, feet, centimeters }
- async miiWeightToMeasurements(miiHeight, miiWeight) | Input a Mii's height, and a Mii's weight (values from 0-127), outputs {pounds,kilograms}
- async inchesToMiiHeight(totalInches) | Provide the total inches, outputs the Mii height
- async centimetersToMiiHeight(totalCentimeters) | Provide the total centimeters, outputs the Mii height
- async imperialHeightWeightToMiiWeight(totalInches, totalPounds) | Provide the total inches, and the total pounds, outputs the Mii Weight
- async metricHeightWeightToMiiWeight(totalCentimeters, totalKilograms) | Provide the total centimeters, and the total kilograms, outputs the Mii Weight
- isMiiInFormat(miiBuffer, format) | Checks if the buffer is in the specified format, returns true or false
- detectMiiFormat(miiBuffer, debug) | Returns an array of MiiFormats this Mii could be in. If we have a structure defined for it, it will validate if each individual value is within the boundaries for that value for that format.
- decodeMii(miiOfAnyKnownWayOfRepresentingIt, debug) | See Mii.create. Returns a Promise only for optional async decoders such as image QR, encrypted QR, or Amiibo data.
- encodeMii(MiiClassOrJSON, format) | See Mii.encode. Returns a Promise only for optional async encoders such as encrypted QR formats.
- async renderMii(mii, options) | See Mii.render
- FFLExpression | See enums
- scanQR(buffer) | Provide a buffer containing a QR code, returns the buffer the QR code represents.
- async makeQR(buffer, options) | Provide a buffer, this outputs a QR code with that buffer. If the buffer is a recognized Mii and Tomodachi render assets are present, this will be rendered as an icon for the QR. See Mii.toQR for options.
- getNestedValue(object, path) | Get the value of an object down a path, returns null if any step of the path is undefined.
- setNestedValue(object, path, value) | Set the value of an object down a path, creating any steps necessary if undefined.
- deleteNestedValue(object, path) | Deletes the key of an object down a path.
- getKeyByValue(object, value) | Returns the key associated with that value, useful for backtracing enums.
- FavoriteColors | See enums

## Tomodachi Rendering Assets
Node rendering uses `CFL_Res.dat` for face feature textures and a Tomodachi Life `romFS` folder for the native body, head, and headwear CGFX models.

Useful options:
- `tomodachiRomfs`: path to a `romFS` folder containing `model/body`, `model/headwear`, and `model/obj/obj_mHead.bin.dat`
- `cflResPath`: path to `CFL_Res.dat`
- `tomodachiBodyId` / `tomodachiHeadwearId`: optional item ids to override the outfit or hat stored on the Mii

## Troubleshooting
- Special Miis **__must__** have the `meta.originalDevice` field set to the __matching__ device. In all other cases, a 3DS can scan a QR who's originalDevice is 4, and a Wii can scan a QR who's originalDevice is 3. However, in the case of Special Miis, to scan on 3DS you __must__ set `originalDevice` to **3**, and to scan on Wii U you __must__ set `originalDevice` to **4**. MiiJS will handle this automatically if you use the Mii class, just make sure to tell the Mii.toQR function you intend to scan on 3DS or Wii U (see ConsoleFormats enum).
- ~~Special Miis require Sharing to be off on 3DS and Wii U~~ MiiJS should handle automatically
- ~~Special Miis require Mingle to be off on Wii~~ MiiJS should handle automatically
- QRs can sometimes not scan if encoded for the other console even when not Special. I'm not sure what the correlation is, but making sure to tell the Mii.toQR function which console you're scanning it on should be bulletproof. If you're using makeQR, encode to `MiiFormats.CFED` for 3DS, and `MiiFormats.FFED` for Wii U. These enforce making sure meta.originalDevice is 3 and 4 respectively, which should prevent all scan issues. For game-specific 3DS QR output, use Tomodachi Life/TLE for `MiiFormats.TLE`, or Miitopia/MT/MTE for `MiiFormats.MTE` when Miitopia `mt.warCry` or Tomodachi Life `tl.catchphrase` can provide a war cry.

### Tomodachi Life clothing rendering

Decoded TLC, TLS, and TLE data preserves the clothing item IDs and their independent four-bit palette selectors in these fields:

- `tl.clothing.outfit` and `tl.clothing.outfitColor`
- `tl.clothing.hat` and `tl.clothing.hatColor`

The item IDs are raw little-endian hex strings, while each color field is a catalog palette slot from 0 through 15. Regular clothes (outfit `0000`) are the exception: Tomodachi Life applies `general.favoriteColor` to that model at runtime. Objects decoded by older MiiJS versions do not contain the previously discarded selector bits; decode the original TLC, TLS, or TLE data again to recover them.

## Supported types
By order of console release. A difference of C vs S dictates not having vs having checksums respectively.
### Nintendo DS
- .ncd, .nsd
    - DS Miis, same as Wii equivalents with some Endian swaps
### Wii
- .rcd, .rsd
    - Wii Miis
### 3DS
- .cfcd, .cfsd
    - Decrypted/Internal 3DS Miis, same as their FFCD/FFSD counterparts past one number (Only matters for special Miis)
- .cfed
    - Encrypted CFSD for QR code purposes. No different than FFED.
- .png, .jpg
    - QR Codes can be scanned and recreated
- .tl, .tl_alt, .tomodachilife
    - Tomodachi Life QR Code Mii data after being decrypted in various sizes/aliases
- .tle
    - Tomodachi Life QR Code Encrypted data.
- .mt, .miitopia
    - Miitopia QR Code Mii data after being decrypted
- .mte
    - Miitopia QR Code Encrypted data.
### Wii U
- .ffcd, .ffsd
    - Decrypted/Internal Wii U Miis, same as their CFCD/CFSD counterparts past one number (Only matters for special Miis)
- .ffed
    - Encrypted FFSD for QR code purposes. No different than CFED.
- .png, .jpg
    - QR Codes can be scanned and recreated
### Amiibo
- .ntag, .ntag_alt
    - Amiibo files in various sizes
- .ntag_internal
    - Decrypted Amiibo files
### Miitomo (Untested)
- .miitomo
    - Miitomo QR Code Mii data after being decrypted
- .miitomoe
    - Miitomo QR Code Encrypted data.
### Switch/2
- .nfcd, .nfsd .switchdb
    - Switch NAND format for the Mii Maker applet
- .charinfo
    - Switch format as used by games
### My Nintendo Mii Studio/Browser
- .mnms, .studio, .localstorage
    - The format stored in localstorage in the Mii Studio website
- .emnms
    - The encrypted Studio image request format
### Other
These formats are decodable and encodeable but not recommended as a file extension for use, as other formats are precisely equivalent and these specific names are either non specific, rarely used, or outdated.
- .ver3
- .mii, .mae, .miigx
- .ufsd, .sampledb
---
- UFSD, MII, MIIGX, MAE, are unofficial names from the community.
- MNMS and NCD/NSD are unofficial names sourced from [HEYimHeroic](https://github.com/HEYimHeroic)'s [Mii Data Files Repository](https://github.com/HEYimHeroic/MiiDataFiles), as well as documenting CFCD/FFCD, NFSD/NFCD, being highly likely official names but not used in any official capacity at this time.
- CFED/FFED, TL/TL_ALT/TLE/TOMODACHILIFE, MT/MTE/MIITOPIA, MIITOMO/MIITOMOE, STUDIO/LOCALSTORAGE, are unofficial names presented by library authors due to no other official name being recognized but distinction being necessary.

## Other Useful Tools to Use with MiiJS
Each of these is personally used and vetted by at least one of the library authors.
- Our own [WiimoteBridge](https://github.com/Stewared/WiimoteBridge) is a tool we've been developing designed to make connecting a Wiimote to your device for purposes such as transferring Miis on and off of your Wii much easier.
- [InfiniMii's Wiimote Tools Page](https://infinimii.com/wiimote) is a tool for Chromium browsers to transfer Miis on and off the Wiimote
- [Tagmo](https://play.google.com/store/apps/details?id=com.hiddenramblings.tagmo.eightbit) for Android is good for transferring the file on and off of your Amiibo. There are iPhone equivalents, but none we feel comfortable recommending at this time due to predatory subscription or microtransaction models.
- [Nintendo's Mii Studio](https://accounts.nintendo.com/mii_studio) is the only official online Mii Maker and is accessible to anyone with a Nintendo Account. (Must already be logged into [Nintendo's online portal](https://accounts.nintendo.com/) to access the Mii Studio link)
- [HEYimHeroic](https://github.com/HEYimHeroic)'s [Mii Studio Mii Loader](https://github.com/HEYimHeroic/MiiStudioMiiLoader) browser extension lets you import and export Miis from Mii Studio easily.

## Credits
- [HEYimHeroic](https://github.com/HEYimHeroic)'s various work and documentation across many years and articles were and continue to be an invaluable resource to MiiJS' development.

## Disclaimer
Miis, DS, Wii, 3DS, Wii U, Amiibo, Tomodachi Life, Miitomo, Switch, Switch 2, My Nintendo, Mii Studio, and anything else similar is owned fully by Nintendo of which this library and its authors do not represent.
MiiJS is not designed in any way to replace or make Miis on their original hardware obsolete. MiiJS is designed exclusively to enhance Miis and the enjoyment and usability of Miis. No copyrighted material is made available through MiiJS, and if at any point copyrighted material is unintentionally made available, please be sure to contact the authors to have it removed immediately.
