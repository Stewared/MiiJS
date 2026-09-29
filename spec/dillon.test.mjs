import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import {
    applyDillonAppearance,
    createDillonGeometry,
    createDillonModel,
    DILLON_AMIIMAL_TYPES,
    DILLON_FACE_FRAME,
    disposeDillonModel,
    getDillonAmiimalTypes,
    getDillonAppearanceParameters,
    getDillonCamera,
    getDillonFaceAnchors,
    getDillonMiiFacialFeatures,
    getDillonPoseTransforms,
    initializeDillonTextures,
    rankDillonAmiimals,
    resolveDillonAnimal
} from "../dillon.js";
import {
    convertCharInfoToCharInfoEx,
    projectReviewedLtdCharInfoToCharInfo
} from "../miiConversion.js";
import { decodeMii, encodeMii } from "../miiProcess.js";
import { parseCharInfoEx } from "../ltd.js";

const dillonAssetsUrl = new URL("../dillon/assets/", import.meta.url);
const dillonAssetsPath = fileURLToPath(dillonAssetsUrl);
const assetTest = existsSync(dillonAssetsPath) ? test : test.skip;
const originalFixture = decodeMii(await readFile(new URL("./fixtures/dillon/Claire.cfcd", import.meta.url)));

// Ground truth from executing the game's original ARM scorer and menu filter.
for (const [file, choices, ids, scores] of [
    ["Claire.cfcd", ["Fox", "Wolf", "Rabbit", "Tiger"],
        [2, 3, 6, 7, 4, 8, 10, 5, 9, 1], [9, 8, 8, 8, 5, 4, 2, 0, -10, -10]],
    ["Kestron.ffcd", ["Sheep", "Mouse", "Fox", "Tiger"],
        [4, 8, 2, 7, 3, 10, 5, 9, 6, 1], [6, 6, 5, 3, 3, 2, -6, -8, -8, -10]],
    ["Luke.ffsd", ["Sheep", "Mouse", "Wolf", "Tiger"],
        [4, 8, 3, 2, 10, 7, 6, 5, 9, 1], [9, 8, 5, 5, 5, 4, -3, -6, -10, -10]],
    ["Maddie.cfsd", ["Sheep", "Mouse", "Wolf", "Tiger"],
        [4, 8, 3, 6, 7, 2, 10, 5, 9, 1], [9, 9, 5, 5, 5, 4, 4, 3, -10, -10]]
]) {
    test(`matches native scores, tie order and four menu slots for ${file}`, async () => {
        const mii = await decodeMii(await readFile(new URL(`./fixtures/dillon/${file}`, import.meta.url)));
        const before = structuredClone(mii);
        const ranking = rankDillonAmiimals(mii);
        assert.deepEqual(ranking.map(item => item.id), ids);
        assert.deepEqual(ranking.map(item => item.score), scores);
        assert.deepEqual(ranking.map(item => item.type), ids.map(id => DILLON_AMIIMAL_TYPES[id]));
        assert.deepEqual(getDillonAmiimalTypes(mii), choices);
        assert.deepEqual(getDillonAmiimalTypes({ fields: mii }), choices);
        assert.deepEqual(mii, before);
    });
}
test("modern colors and other unscored fields do not change Amiimal choices", async () => {
    const mii = await decodeMii(await readFile(new URL("./fixtures/dillon/Claire.cfcd", import.meta.url)));
    const expected = rankDillonAmiimals(mii);
    mii.face.color = 9;
    mii.hair.color = 99;
    mii.eyes.color = 99;
    mii.glasses.type = 19;
    mii.general.gender = 0;
    mii.general.height = 127;
    mii.general.weight = 127;
    mii.meta.name = "Different name";
    assert.deepEqual(rankDillonAmiimals(mii), expected);
});

test("partial and older canonical Miis use the same classic defaults as encodeMii", async () => {
    for (const gender of [0, 1]) {
        const partial = { general: { gender }, face: {}, hair: {}, eyes: {}, eyebrows: {},
            nose: {}, mouth: {}, glasses: {}, beard: { mustache: {} } };
        const full = await decodeMii(encodeMii(partial, "cfcd"));
        assert.deepEqual(rankDillonAmiimals(partial), rankDillonAmiimals(full));
    }
});

test("LTD scored geometry agrees with the central reviewed full projection", () => {
    const classic = Buffer.from("000000000000400080000000000000006e006f0020006e0061006d006500000000000000000000000040400000000000002101000208040304020c0601040306020a010409171304030d080000040a0008040a0004021400", "hex");
    const defaults = parseCharInfoEx(convertCharInfoToCharInfoEx(classic));
    const cases = [
        {},
        { hairType: 206, hairFrontType: 3, facelineType: 18, eyeType: 65, noseType: 20, mouthType: 40 },
        { hairType: 30, hairFrontType: 0, eyeType: 60, noseType: 19, mouthType: 36 },
        { eyeType: 59, eyeAspect: 12, eyeRotate: 15, eyeX: 25, eyeY: 25, noseScale: 14, noseY: 25, mouthScale: 14 }
    ];
    for (const overrides of cases) {
        const charInfo = Object.assign(structuredClone(defaults), overrides);
        const reviewed = decodeMii(projectReviewedLtdCharInfoToCharInfo(charInfo));
        const mii = { ltd: { charInfo } };
        assert.deepEqual(getDillonMiiFacialFeatures(mii), getDillonMiiFacialFeatures(reviewed));
        assert.deepEqual(rankDillonAmiimals(mii), rankDillonAmiimals(reviewed));
    }
});

test("rejects invalid scored selectors rather than indexing outside native tables", () => {
    for (const type of [-1, 132, 2.5, NaN]) {
        assert.throws(() => getDillonAmiimalTypes({ hair: { type } }), /Invalid Dillon Mii hairType/);
    }
    assert.throws(() => rankDillonAmiimals(new Uint8Array(92)), /decoded Mii object/);
    assert.throws(() => rankDillonAmiimals(null), /decoded Mii object/);
});

const nativeCases = JSON.parse(await readFile(new URL("./fixtures/dillon/native-appearance.json", import.meta.url), "utf8"));

test("all animal field mutations and muzzle scales match original ARM execution", () => {
    assert.equal(nativeCases.length, 160);
    for (const item of nativeCases) {
        const source = decodeMii(Buffer.from(item.sourceHex, "hex"));
        const expected = decodeMii(Buffer.from(item.convertedHex, "hex"));
        const before = structuredClone(source);
        const actual = applyDillonAppearance(source, item.animal);
        assert.deepEqual(actual, expected, `${item.file} animal ${item.animal}`);
        assert.deepEqual(source, before);
        assert.equal(getDillonAppearanceParameters(item.animal, source).nose.scale,
            item.noseScale, `${item.file} animal ${item.animal} native muzzle scale`);
    }
});

test("uses species-specific palettes and nose constraints", () => {
    assert.equal(getDillonAppearanceParameters("Rabbit").nose.yPosition, 11);
    assert.deepEqual(getDillonAppearanceParameters("Fox").hairColor, [183, 109, 22, 255]);
    assert.deepEqual(getDillonAppearanceParameters("Fox").faceColor, [204, 119, 34, 255]);
});

test("face shape supplies native beard anchors independently of beard activity", async () => {
    const groundTruth = JSON.parse(await readFile(new URL("./fixtures/dillon/native-anchors.json", import.meta.url), "utf8"));
    assert.equal(groundTruth.facelines.length, 12);
    for (const { faceType, hair, nose, beard } of groundTruth.facelines) {
        const expected = { hair, nose, beard };
        for (const type of [0, 1, 5]) {
            const mii = { face: { type: faceType }, beard: { type } };
            assert.deepEqual(getDillonFaceAnchors(mii), expected);
            assert.deepEqual(getDillonAppearanceParameters("Fox", mii).anchors, expected);
        }
    }
    assert.deepEqual(getDillonFaceAnchors({ face: { type: 2 } }).beard,
        [0, Math.fround(-1.71), Math.fround(-1.31)]);
    const edited = getDillonFaceAnchors({ face: { type: 2 } });
    edited.beard[1] = 100;
    assert.equal(getDillonFaceAnchors({ face: { type: 2 } }).beard[1], Math.fround(-1.71));
});

test("face paint follows the native clamped nose position", () => {
    const lower = getDillonAppearanceParameters("Fox", { nose: { yPosition: 0 } });
    const upper = getDillonAppearanceParameters("Fox", { nose: { yPosition: 18 } });
    assert.equal(lower.nose.yPosition, 12);
    assert.equal(upper.nose.yPosition, 13);
    assert.equal(lower.facePaint.textureName, "fox_facePaint");
    assert.equal(lower.facePaint.heightFraction, 1);
    assert.ok(Math.abs(lower.facePaint.offsetYFraction - 1 / 12) < 1e-7);
    assert.ok(Math.abs(upper.facePaint.offsetYFraction - 1 / 9) < 1e-7);
});

test("supports Mii wrappers and rejects unknown animals or unprojected LTD rendering input", () => {
    assert.deepEqual(applyDillonAppearance({ fields: {} }, "Sheep"), applyDillonAppearance({}, 4));
    assert.throws(() => getDillonAppearanceParameters("Puma"), /Unknown Dillon Amiimal type/);
    assert.throws(() => applyDillonAppearance({ ltd: {} }, "Cat"), /Project LTD/);
});

function project(point, camera) {
    camera.updateMatrixWorld(true);
    return point.clone().project(camera);
}

function assertClose(actual, expected, label, tolerance = 1e-7) {
    assert.ok(Math.abs(actual - expected) < tolerance, `${label}: ${actual} versus ${expected}`);
}

function transforms(group) {
    const result = [];
    group.traverse(object => result.push({ name: object.name, position: object.position.toArray(),
        rotation: object.quaternion.toArray(), scale: object.scale.toArray() }));
    return result;
}

test("face framing matches the existing native dashboard crop at every game head scale", () => {
    assert.equal(DILLON_FACE_FRAME.span, 469 / 4.45);
    assert.equal(DILLON_FACE_FRAME.centerX, -0.5 / 4.45);
    assert.equal(DILLON_FACE_FRAME.centerY, 144.5 / 4.45);
    for (const scale of [0.04125, 0.044, 0.0495, 0.054]) {
        const model = new THREE.Group();
        model.scale.setScalar(0.55);
        const head = new THREE.Group();
        head.name = "DillonHead";
        head.position.set(2, 10, -1);
        head.scale.setScalar(scale / 0.55);
        model.add(head);
        const camera = getDillonCamera(model, THREE);
        const center = head.localToWorld(new THREE.Vector3(-0.5 / 4.45, 144.5 / 4.45, 0));
        const projected = project(center, camera);
        assertClose(projected.x, 0, "head center X");
        assertClose(projected.y, 0, "head center Y");
        assertClose(camera.right - camera.left, (469 / 4.45) * scale, "fixed raw head span");
        const origin = project(head.getWorldPosition(new THREE.Vector3()), camera);
        assertClose(origin.y, -289 / 469, "head origin has the same pixel placement at every scale");
        const top = project(head.localToWorld(new THREE.Vector3(0, 85.16853932584269, 0)), camera);
        const bottom = project(head.localToWorld(new THREE.Vector3(0, -20.2247191011236, 0)), camera);
        assertClose(top.y, 1, "native face crop top");
        assertClose(bottom.y, -1, "native face crop bottom");
    }
});

for (const animal of DILLON_AMIIMAL_TYPES.slice(1)) {
    test(`${animal} face preview crops its retained standing body and ignores oversized species attachments`,
        { skip: !existsSync(dillonAssetsPath) }, async () => {
        const mii = applyDillonAppearance(originalFixture, animal);
        const parameters = getDillonAppearanceParameters(animal, originalFixture);
        const charModel = { meshes: new THREE.Group(),
            facelineColor: new THREE.Color().setRGB(...parameters.faceColor.slice(0, 3).map(value => value / 255), THREE.SRGBColorSpace),
            getMask: () => null, getFaceline: () => null };
        let model;
        try {
            model = await createDillonModel(mii, charModel, THREE,
                { animal, originalMii: originalFixture, fullBody: true, dillonAssetsPath });
            const body = model.getObjectByName("DillonBody");
            const head = model.getObjectByName("DillonHead");
            assert.ok(body?.children.length && head?.children.length);
            const before = transforms(model);
            const camera = getDillonCamera(model, THREE);
            const center = head.localToWorld(new THREE.Vector3(-0.5 / 4.45, 144.5 / 4.45, 0));
            assertClose(project(center, camera).x, 0, "native posed head center X");
            assertClose(project(center, camera).y, 0, "native posed head center Y");
            assertClose((camera.right - camera.left) / head.getWorldScale(new THREE.Vector3()).y,
                469 / 4.45, "face span stays independent of species bounds");
            const bodyPoints = [];
            body.traverse(mesh => {
                if (!mesh.isMesh) return;
                for (let vertex = 0; vertex < mesh.geometry.attributes.position.count; vertex++) {
                    bodyPoints.push(new THREE.Vector3()
                        .fromBufferAttribute(mesh.geometry.attributes.position, vertex)
                        .applyMatrix4(mesh.matrixWorld));
                }
            });
            assert.ok(bodyPoints.length > 100, "the full native standing body remains in the preview scene");
            const facePoints = bodyPoints.map(point => project(point, camera));
            assert.ok(facePoints.some(point => Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1 && Math.abs(point.z) <= 1),
                "upper-body geometry is visible in the face crop");
            assert.ok(facePoints.some(point => point.y < -1), "face camera crops the lower body");
            const fullBodyCamera = getDillonCamera(model, THREE, true);
            for (const point of bodyPoints) {
                const projected = project(point, fullBodyCamera);
                assert.ok(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && Math.abs(projected.z) < 1,
                    "whole-body camera contains every standing body vertex");
            }
            assert.deepEqual(transforms(model), before, "camera choice does not move or detach the head/body");
            const oversized = new THREE.Mesh(new THREE.BoxGeometry(10000, 20000, 5000), new THREE.MeshBasicMaterial());
            oversized.name = "oversized ear or headwear";
            head.add(oversized);
            try {
                const unchanged = getDillonCamera(model, THREE);
                assert.deepEqual(unchanged.position.toArray(), camera.position.toArray());
                assert.deepEqual(unchanged.quaternion.toArray(), camera.quaternion.toArray());
                assert.equal(unchanged.top, camera.top);
                assert.equal(unchanged.left, camera.left);
            } finally {
                head.remove(oversized);
                oversized.geometry.dispose();
                oversized.material.dispose();
            }
        } finally {
            if (model) disposeDillonModel(model);
        }
    });
}

test("face framing reports a missing head instead of fitting unrelated body geometry", () => {
    assert.throws(() => getDillonCamera(new THREE.Group(), THREE), /no head for face framing/);
});

const nativeAnchors = JSON.parse(await readFile(new URL("./fixtures/dillon/native-anchors.json", import.meta.url), "utf8")).facelines;
const nativeRendering = {
    skinning: JSON.parse(await readFile(
        new URL("./fixtures/dillon/native-idle-skinning.json", import.meta.url),
        "utf8"
    )).references,
    headScale: { Duck: 0.75, Rabbit: 0.75, Mouse: 0.75,
        Fox: Math.fround(0.8), Wolf: Math.fround(0.8), Sheep: Math.fround(0.8), Cat: Math.fround(0.8),
        Bull: Math.fround(0.9), Bear: Math.fround(0.9), Tiger: Math.fround(0.9) }
};

async function readDillonAsset(relative) {
    return JSON.parse(await readFile(new URL(relative, dillonAssetsUrl), "utf8"));
}

function makeMii(faceType = 2) {
    const mii = structuredClone(originalFixture);
    mii.face.type = faceType;
    mii.hair.type = 57; // Real native head asset has a cap supplied by FFL.
    mii.hair.flipped = true;
    mii.nose.yPosition = 0; // Exercise animal clamping before attachment placement.
    mii.nose.size = 5;
    mii.beard.type = 1;
    mii.glasses.type = 1;
    return mii;
}

function syntheticCharModel(parameters, withTargets = false) {
    const meshes = new THREE.Group();
    for (const [name, type] of [["FFL cap", 5], ["FFL glasses", 8], ["FFL beard", 1], ["FFL nose", 2]]) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
        geometry.setIndex([0, 1, 2]);
        geometry.userData.modulateType = type;
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x123456 }));
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        // Deliberately unrelated transforms catch use of the wrong anchor.
        mesh.matrix.makeTranslation(type + 100, type + 200, type + 300);
        meshes.add(mesh);
    }
    const target = () => ({ texture: new THREE.Texture() });
    const mask = withTargets ? target() : null;
    const faceline = withTargets ? target() : null;
    return {
        meshes,
        facelineColor: new THREE.Color().setRGB(...parameters.faceColor.slice(0, 3).map(value => value / 255), THREE.SRGBColorSpace),
        partsTransform: { hatTranslate: new THREE.Vector3(70, 80, 90) },
        getMask: () => mask,
        getFaceline: () => faceline
    };
}

function snapshotCharModel(charModel) {
    return charModel.meshes.children.map(mesh => ({
        name: mesh.name,
        matrix: [...mesh.matrix.elements],
        positions: [...mesh.geometry.attributes.position.array],
        indices: [...mesh.geometry.index.array],
        color: mesh.material.color.toArray()
    }));
}

function assertVector(actual, expected, label, tolerance = 1e-7) {
    for (let axis = 0; axis < 3; axis++) {
        assert.ok(Math.abs(actual.getComponent(axis) - expected[axis]) < tolerance,
            `${label} axis ${axis}: ${actual.getComponent(axis)} versus ${expected[axis]}`);
    }
}

function releaseSynthetic(charModel) {
    for (const mesh of charModel.meshes.children) {
        mesh.geometry.dispose();
        mesh.material.dispose();
    }
    charModel.getMask()?.texture.dispose();
    charModel.getFaceline()?.texture.dispose();
}

for (const animal of DILLON_AMIIMAL_TYPES.slice(1)) {
    assetTest(`assembles ${animal} from supplied assets with native anchors and FFL accessories`, async () => {
        const source = makeMii();
        const mii = applyDillonAppearance(source, animal);
        const originalSource = structuredClone(source);
        const originalMii = structuredClone(mii);
        const parameters = getDillonAppearanceParameters(animal, source);
        const charModel = syntheticCharModel(parameters);
        const originalChar = snapshotCharModel(charModel);
        let group;
        try {
            group = await createDillonModel(mii, charModel, THREE,
                { animal, originalMii: source, fullBody: true, dillonAssetsPath });
            assert.equal(group.userData.animal, animal);
            const head = group.getObjectByName("DillonHead");
            const body = group.getObjectByName("DillonBody");
            assert.ok(head && body);
            assert.ok(head.getObjectByName("Faceline02"));
            assert.ok(head.getObjectByName("Mask02"));
            const nose = head.children.find(part => part.name.endsWith("Nose"));
            assert.ok(nose, "animal muzzle resolves to a real game mesh");
            const anchors = nativeAnchors[2];
            assertVector(nose.position, anchors.nose.map((value, axis) => value + parameters.nose.offset[axis]), "muzzle position");
            assertVector(nose.scale, Array(3).fill(parameters.nose.scale / parameters.unitScale), "muzzle size");
            const ear = head.children.find(part => part.name.endsWith("Ear"));
            assert.equal(Boolean(ear), animal !== "Duck");
            if (ear) assertVector(ear.position, anchors.hair, "ear position");
            const cheek = head.children.find(part => part.name.endsWith("Cheek"));
            assert.equal(Boolean(cheek), !["Bull", "Sheep", "Cat"].includes(animal));
            if (cheek) assertVector(cheek.position, anchors.beard, "cheek position");
            for (const name of ["FFL cap", "FFL glasses"]) {
                const original = charModel.meshes.getObjectByName(name);
                const cloned = head.getObjectByName(name);
                assert.ok(cloned);
                assert.notEqual(cloned.geometry, original.geometry);
                assert.notEqual(cloned.material, original.material);
                assert.deepEqual(cloned.matrix.elements, original.matrix.elements);
                assert.deepEqual(cloned.material.color.toArray(), original.material.color.toArray());
            }
            const beard = head.getObjectByName("FFL beard");
            assert.equal(Boolean(beard), !parameters.hide.beard);
            if (beard) {
                const color = new THREE.Color().setRGB(...parameters.hairColor.slice(0, 3).map(value => value / 255), THREE.SRGBColorSpace);
                assert.deepEqual(beard.material.color.toArray(), color.toArray());
            }
            assert.equal(head.getObjectByName("FFL nose"), undefined, "native muzzle replaces original Mii nose");
            assert.equal(head.children.some(child => /^Cap/.test(child.name)), false, "FFL supplies the textured cap once");
            for (const child of head.children.filter(child => /^(Hair|Forehead)/.test(child.name))) {
                assertVector(child.position, anchors.hair, "hair position");
                assert.equal(child.scale.x, -1);
            }
            let animalTriangles = 0;
            nose.traverse(mesh => {
                if (!mesh.isMesh) return;
                assert.ok(mesh.material.map?.isDataTexture, "actual PNG textures load without a GPU");
                animalTriangles += mesh.geometry.index.count / 3;
            });
            assert.ok(animalTriangles > 0);
            const bodyAsset = await readDillonAsset(`models/kmBody${nose.name.slice(6, 9)}Fr.json`);
            assert.ok(bodyAsset.models.every(model => body.getObjectByName(model.name)), "selected runtime body meshes all resolve");
            const headBone = bodyAsset.models[0].bones.find(bone => bone.name === "Head");
            assert.ok(headBone, "native body skeleton provides its Head attachment");
            const nativeTransform = new THREE.Matrix4().fromArray(
                (await readDillonAsset("poses/idle.json")).worldMatrices[animal].bones.Head);
            const position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3();
            nativeTransform.decompose(position, rotation, scale);
            assertVector(head.position, position.toArray(), "native idle Head attachment", 1e-5);
            assert.ok(head.quaternion.angleTo(rotation) < 1e-5, "native idle head attachment keeps its bone rotation");
            const localScale = parameters.unitScale * nativeRendering.headScale[animal];
            assertVector(head.scale, scale.multiplyScalar(localScale).toArray(), "native per-species head scale");
            const bodyScale = Math.fround(animal === "Tiger" ? 0.6 : 0.55);
            assertVector(group.scale, Array(3).fill(bodyScale), "native whole-model body scale");
            group.updateMatrixWorld(true);
            assertVector(head.getWorldPosition(new THREE.Vector3()), position.multiplyScalar(bodyScale).toArray(), "body scale applies to the head anchor", 1e-5);
            for (const sample of nativeRendering.skinning.find(reference => reference.animal === animal).samples) {
                const model = bodyAsset.models[sample.model];
                const mesh = model.meshes[sample.mesh];
                const beforeMesh = model.meshes.slice(0, sample.mesh).filter(part => model.meshNodesVisibility[part.node] !== false);
                const childIndex = beforeMesh.reduce((count, part) => count + part.submeshes.length, 0) + sample.submesh;
                const geometry = body.getObjectByName(model.name).children[childIndex].geometry;
                const vertexIndex = [...new Set(mesh.submeshes[sample.submesh].indices)].indexOf(sample.sourceVertex);
                assertVector(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, vertexIndex), sample.position, "native idle blended body vertex", 1e-5);
                assertVector(new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal, vertexIndex), sample.normal, "native idle blended body normal", 1e-5);
            }
            assert.deepEqual(mii, originalMii);
            assert.deepEqual(source, originalSource);
            assert.deepEqual(snapshotCharModel(charModel), originalChar);
        } finally {
            if (group) disposeDillonModel(group);
            releaseSynthetic(charModel);
        }
    });
}

assetTest("head-only models use face-dependent anchors without FFL nose or beard geometry", async () => {
    for (const faceType of [0, 2, 8, 11]) {
        const source = makeMii(faceType);
        const mii = applyDillonAppearance(source, "Fox");
        const parameters = getDillonAppearanceParameters("Fox", source);
        const charModel = syntheticCharModel(parameters);
        for (const name of ["FFL nose", "FFL beard"]) {
            const mesh = charModel.meshes.getObjectByName(name);
            charModel.meshes.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        let group;
        try {
            group = await createDillonModel(mii, charModel, THREE,
                { animal: "Fox", originalMii: source, dillonAssetsPath });
            const head = group.getObjectByName("DillonHead");
            const anchors = nativeAnchors[faceType];
            assertVector(head.getObjectByName("kmFaceFoxNose").position,
                anchors.nose.map((value, axis) => value + parameters.nose.offset[axis]), "nose anchor without FFL nose");
            assertVector(head.getObjectByName("kmFaceFoxCheek").position, anchors.beard, "cheek anchor without beard");
            assertVector(head.scale, [1, 1, 1], "head-only original model units");
            assert.equal(group.getObjectByName("DillonBody"), undefined);
        } finally {
            if (group) disposeDillonModel(group);
            releaseSynthetic(charModel);
        }
    }
});

assetTest("an explicit bind diagnostic preserves the native rest body and static Head attachment", async () => {
    const source = makeMii();
    const mii = applyDillonAppearance(source, "Fox");
    const parameters = getDillonAppearanceParameters("Fox", source);
    const charModel = syntheticCharModel(parameters);
    const asset = await readDillonAsset("models/kmBodyFoxFr.json");
    let group;
    try {
        group = await createDillonModel(mii, charModel, THREE,
            { animal: "Fox", originalMii: source, fullBody: true, bodyPose: "bind", dillonAssetsPath });
        const headBone = asset.models[0].bones.find(bone => bone.name === "Head");
        assertVector(group.getObjectByName("DillonHead").position,
            headBone.worldTransform.slice(12, 15), "bind Head attachment");
        const mesh = asset.models[0].meshes[0];
        const geometry = group.getObjectByName("DillonBody").getObjectByName(asset.models[0].name).children[0].geometry;
        const referenced = [...new Set(mesh.submeshes[0].indices)];
        for (const [index, vertex] of referenced.entries()) {
            assertVector(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, index), mesh.position.slice(vertex * 3, vertex * 3 + 3), "unchanged bind vertex", 1e-6);
        }
    } finally {
        if (group) disposeDillonModel(group);
        releaseSynthetic(charModel);
    }
});

assetTest("uses generated FFL feature targets on native faceline and mask meshes", async () => {
    const source = makeMii();
    const mii = applyDillonAppearance(source, "Cat");
    const parameters = getDillonAppearanceParameters("Cat", source);
    const charModel = syntheticCharModel(parameters, true);
    let group;
    try {
        group = await createDillonModel(mii, charModel, THREE,
            { animal: "Cat", originalMii: source, dillonAssetsPath });
        const faceline = group.getObjectByName("Faceline02");
        const mask = group.getObjectByName("Mask02");
        assert.ok(faceline && mask);
        assert.equal(faceline.children[0].material.map, charModel.getFaceline().texture);
        assert.equal(mask.children[0].material.map, charModel.getMask().texture);
        assert.equal(mask.children[0].material.transparent, true);
        assert.equal(mask.children[0].material.depthWrite, false);
        for (const target of [charModel.getFaceline(), charModel.getMask()]) {
            assert.equal(target.texture.repeat.y, -1);
            assert.equal(target.texture.offset.y, 1);
        }
    } finally {
        if (group) disposeDillonModel(group);
        releaseSynthetic(charModel);
    }
});

test("animal options accept enum IDs and names and default to the first native menu choice", () => {
    assert.equal(resolveDillonAnimal(undefined, originalFixture), "Fox");
    assert.equal(resolveDillonAnimal(7, originalFixture), "Rabbit");
    assert.equal(resolveDillonAnimal("  tIGer  ", originalFixture), "Tiger");
    assert.throws(() => resolveDillonAnimal("Puma", originalFixture), /Dillon animal must be/);
});

test("requires an explicit asset directory in Node.js", async () => {
    await assert.rejects(createDillonModel({}, {}, THREE, { animal: "Fox" }), /dillonAssetsPath/);
    await assert.rejects(initializeDillonTextures({}, {}, class {}, THREE,
        getDillonAppearanceParameters("Fox")), /dillonAssetsPath/);
});

function makeCompositorScene(background) {
    const scene = new THREE.Scene();
    scene.background = background;
    const detail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x123456 }));
    detail.name = "original Mii facial detail";
    scene.add(detail);
    return { scene, detail };
}

assetTest("composites native animal paint beneath facial details and leaves the mask scene untouched", async () => {
    const source = makeMii();
    const before = structuredClone(source);
    const parameters = getDillonAppearanceParameters("Fox", source);
    const faceline = makeCompositorScene(new THREE.Color(0xff00ff));
    const mask = makeCompositorScene(null);
    const background = new THREE.Color().setRGB(...parameters.faceColor.slice(0, 3).map(value => value / 255), THREE.SRGBColorSpace);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    const calls = [];
    const renderer = { render(scene, renderedCamera) { calls.push({ scene, renderedCamera, receiver: this }); } };
    const render = renderer.render;
    const Material = class {};
    let invocations = 0;
    const charModel = {
        facelineColor: background,
        initTextures(actualRenderer, actualMaterial) {
            invocations++;
            assert.equal(actualRenderer, renderer);
            assert.equal(actualMaterial, Material);
            actualRenderer.render(faceline.scene, camera);
            actualRenderer.render(mask.scene, camera);
        }
    };
    let paint;
    try {
        assert.equal(await initializeDillonTextures(charModel, renderer, Material, THREE, parameters,
            { dillonAssetsPath }), null);
        assert.equal(invocations, 1);
        assert.equal(renderer.render, render);
        assert.deepEqual(calls.map(call => call.scene), [faceline.scene, mask.scene]);
        assert.ok(calls.every(call => call.receiver === renderer && call.renderedCamera === camera));
        assert.equal(faceline.scene.background, background);
        assert.equal(mask.scene.background, null);
        assert.equal(faceline.scene.children.length, 2);
        assert.equal(mask.scene.children.length, 1);
        paint = faceline.scene.children.find(child => child !== faceline.detail);
        assert.ok(paint.isMesh);
        assert.ok(paint.renderOrder < faceline.detail.renderOrder, "paint renders before the original wrinkles/makeup/beard detail");
        const { offsetYFraction: top, heightFraction: bottom } = parameters.facePaint;
        assert.equal(paint.geometry.parameters.width, 2);
        assert.equal(paint.geometry.parameters.height, 2 * (bottom - top), "native bottom endpoint is not a height");
        assert.equal(paint.position.y, 1 - top - bottom);
        assert.ok(paint.material.map.isDataTexture);
        assert.equal(paint.material.map.flipY, true, "native bottom-origin paint UVs use the PNG orientation");
        assert.ok(paint.material.map.image.width > 0 && paint.material.map.image.height > 0);
        const color = new THREE.Color().setRGB(...parameters.facePaintColor.slice(0, 3).map(value => value / 255), THREE.SRGBColorSpace);
        assert.deepEqual(paint.material.color.toArray(), color.toArray());
        assert.equal(paint.material.opacity, parameters.facePaintColor[3] / 255);
        for (const material of [paint.material, faceline.detail.material]) {
            assert.equal(material.transparent, true);
            assert.equal(material.depthTest, false);
            assert.equal(material.depthWrite, false);
        }
        assert.equal(mask.detail.material.transparent, false);
        assert.equal(mask.detail.material.depthTest, true);
        assert.equal(mask.detail.material.depthWrite, true);
        assert.deepEqual(faceline.detail.material.color.toArray(), new THREE.Color(0x123456).toArray());
        assert.deepEqual(source, before);
    } finally {
        for (const mesh of [faceline.detail, mask.detail, paint].filter(Boolean)) {
            mesh.geometry.dispose();
            mesh.material.map?.dispose();
            mesh.material.dispose();
        }
    }
});

assetTest("propagates FFL texture initialization errors and restores the renderer while disposing native paint", async () => {
    const parameters = getDillonAppearanceParameters("Cat", makeMii());
    const { scene, detail } = makeCompositorScene(new THREE.Color(0xff00ff));
    const error = new Error("synthetic FFL initTextures failure");
    const disposed = new Set();
    let paint;
    const renderer = {
        render(renderedScene) {
            paint = renderedScene.children.find(child => child !== detail);
            for (const [label, disposable] of [["geometry", paint.geometry], ["material", paint.material], ["texture", paint.material.map]]) {
                disposable.addEventListener("dispose", () => disposed.add(label));
            }
        }
    };
    const render = renderer.render;
    const charModel = {
        facelineColor: new THREE.Color(0xabcdef),
        initTextures(actualRenderer) {
            actualRenderer.render(scene, new THREE.Camera());
            throw error;
        }
    };
    try {
        await assert.rejects(initializeDillonTextures(charModel, renderer, class {}, THREE, parameters,
            { dillonAssetsPath }), caught => caught === error);
        assert.equal(renderer.render, render);
        assert.deepEqual(disposed, new Set(["geometry", "material", "texture"]));
    } finally {
        detail.geometry.dispose();
        detail.material.dispose();
    }
});

const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const model = { bones: [
    { name: "Root", parent: -1, worldTransform: identity, inverseTransform: identity },
    { name: "LeftArm", parent: 0,
        worldTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
        inverseTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 1] },
    { name: "RightArm", parent: 0,
        worldTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 1],
        inverseTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1] }
] };
// Exact quarter turns make the expected skinning arithmetic independent of Three.js.
const pose = { bones: {
    LeftArm: { localMatrix: [0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1] },
    RightArm: { localMatrix: [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, -1, 0, 0, 1] }
} };
const mesh = {
    position: [0, 0, 0, 0, 2, 0, 1000, 1000, 1000, 2, 1, 0],
    normal: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    uv: [0, 0, 0, 1, 1, 1, 1, 0],
    boneIndices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    boneWeights: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0.75, 0.25, 0, 0]
};
const submesh = { indices: [3, 0, 1], skinning: "Smooth", boneTable: [2, 1] };

function assertValues(actual, expected, tolerance = 1e-7) {
    assert.equal(actual.length, expected.length);
    actual.forEach((value, index) => assert.ok(Math.abs(value - expected[index]) < tolerance,
        `value ${index}: ${value} versus ${expected[index]}`));
}

test("blends smooth positions and normals through each submesh palette and preserves source data", () => {
    const before = structuredClone({ mesh, submesh, model, pose });
    const world = getDillonPoseTransforms(model, pose, THREE);
    const geometry = createDillonGeometry(mesh, submesh, model, THREE, world);
    const reversed = createDillonGeometry(mesh, { ...submesh, boneTable: [1, 2] }, model, THREE, world);
    try {
        // First vertex: .75*(2,-1,0) + .25*(-2,3,0) = (1,0,0).
        assertValues([...geometry.attributes.position.array], [1, 0, 0, -1, 1, 0, 0, 2, 0]);
        assertValues([...geometry.attributes.normal.array], [1, 0, 0, -1, 0, 0, 0, 1, 0]);
        assertValues([...reversed.attributes.position.array], [-1, 2, 0, 1, 1, 0, 0, 2, 0]);
        assertValues([...reversed.attributes.normal.array], [-1, 0, 0, 1, 0, 0, 0, 1, 0]);
        assert.deepEqual([...geometry.index.array], [0, 1, 2]);
        assert.deepEqual([...geometry.attributes.uv.array], [1, 0, 0, 0, 0, 1]);
        assert.equal(geometry.attributes.position.count, 3);
        assert.equal(geometry.boundingBox.max.x, 1, "unused bind vertices do not expand preview bounds");
        assert.equal(geometry.boundingBox.max.z, 0);
        assert.deepEqual({ mesh, submesh, model, pose }, before);
    } finally {
        geometry.dispose();
        reversed.dispose();
    }
});

test("rigid positions stay bone-local and select their vertex palette index", () => {
    const geometry = createDillonGeometry(mesh, { ...submesh, skinning: "Rigid" }, model, THREE,
        getDillonPoseTransforms(model, pose, THREE));
    try {
        assertValues([...geometry.attributes.position.array], [2, -2, 0, -1, 0, 0, -3, 0, 0]);
        assertValues([...geometry.attributes.normal.array], [1, 0, 0, -1, 0, 0, -1, 0, 0]);
    } finally {
        geometry.dispose();
    }
});

test("a bind diagnostic keeps smooth vertices unchanged and compacts only referenced geometry", () => {
    const geometry = createDillonGeometry(mesh, submesh, model, THREE);
    try {
        assertValues([...geometry.attributes.position.array], [2, 1, 0, 0, 0, 0, 0, 2, 0]);
        assertValues([...geometry.attributes.normal.array], [0, 1, 0, 0, 1, 0, 0, 1, 0]);
    } finally {
        geometry.dispose();
    }
});

test("unanimated descendants inherit the animated parent while retaining their bind local offset", () => {
    const child = { name: "Finger", parent: 1,
        worldTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1],
        inverseTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -3, 0, 0, 1] };
    const world = getDillonPoseTransforms({ bones: [...model.bones, child] }, pose, THREE);
    assertValues(world[3].elements.slice(12, 15), [1, -2, 0]);
});

for (const [animal, code, poseName] of [
    ["Bull", "Cow", "L"], ["Fox", "Fox", "M"], ["Wolf", "Wol", "M"],
    ["Sheep", "She", "M"], ["Duck", "Duc", "S"], ["Cat", "Cat", "M"],
    ["Rabbit", "Bun", "S"], ["Mouse", "Mou", "S"], ["Bear", "Bea", "L"],
    ["Tiger", "Tig", "L"]
]) {
    test(`${animal} idle skeleton matches independent native curve evaluation and lowers both hands`,
        { skip: !existsSync(dillonAssetsUrl) }, async () => {
        const nativeIdle = await readDillonAsset("poses/idle.json");
        const asset = await readDillonAsset(`models/kmBody${code}Fr.json`);
        const body = asset.models[0];
        const source = nativeIdle.worldMatrices[animal].bones;
        const pose = nativeIdle.poses[poseName];
        const world = getDillonPoseTransforms(body, pose, THREE);
        for (const [index, bone] of body.bones.entries()) {
            assertValues(world[index].elements, source[bone.name], 1e-5);
        }
        for (const side of ["Left", "Right"]) {
            const index = name => body.bones.findIndex(bone => bone.name === side + name);
            const handY = world[index("Hand")].elements[13];
            const shoulderY = world[index("Shoulder")].elements[13];
            assert.ok(handY < shoulderY - 1, `${side} hand is visibly below the shoulder in the native idle pose`);
        }
    });
}
