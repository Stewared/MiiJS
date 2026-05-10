import {childGenTables,backTables} from "./data.js";
import {decodeMii} from "./miiProcess.js";

function getParentPermission(parent, permission) {
    return parent?.perms?.[permission] ?? true;
}

async function kidomatic(mii,hairGroupIndex=-1){
    if(mii.fields){
        mii=await mii.toJSON();
    }
    mii=await decodeMii(mii);

    //Clear beards and wrinkles
    mii.beard.type=0;
    mii.beard.mustache.type=0;
    mii.face.feature=0;
    //For parity with the original, though I wouldn't be averse to making this a toggle to allow child Miis to generate with these
    mii.face.makeup=0;
    mii.glasses.type=0;
    mii.hair.flipped=false;

    //Child Miis generate the last stage, then build offsets backwards through the younger stages of life starting at the older stages
    var eyeBase = Math.min(Math.max(mii.eyes.yPosition + 2, 0), 18);
    let browBase = mii.eyebrows.yPosition + 2;
    if (browBase > 15) {
        browBase = 15;
    }
    else if (browBase < 0) {
        browBase = 0;
    }

    var mouthBase = Math.min(Math.max(mii.mouth.yPosition - 2, 0), 18);

    var eyeYDelta = mii.eyes.yPosition - eyeBase;
    var browYDelta = mii.eyebrows.yPosition - browBase;
    var mouthYDelta = mii.mouth.yPosition - mouthBase;

    //Now we take the baselines above and translate them into the younger years
    mii.stages = [];
    for (var iStage = 0; iStage < 6; iStage++) {
        mii.stages.push(structuredClone(mii));

        mii.stages[iStage].eyes.yPosition=Math.floor((eyeYDelta * iStage)/5) + eyeBase;
        mii.stages[iStage].eyebrows.yPosition=Math.floor((browYDelta * iStage)/5) + browBase;
        mii.stages[iStage].mouth.yPosition=Math.floor((mouthYDelta * iStage)/5) + mouthBase;
        mii.stages[iStage].nose.size=Math.floor((mii.nose.size * iStage)/5);

        if(iStage<4){
            mii.stages[iStage].face.type=9;//Extra technically, I'm fairly certain this still happens just in a different part than I directly researched
            mii.stages[iStage].eyebrows.color=7;
        }

        mii.stages[iStage].general.height=Math.floor((mii.stages[iStage].general.height/5)*iStage);//Extra, Tomodachi Life just uses alternate models and therefore no official height growth is in-game yet one is displayed, so I mocked up a basic growing up height. Newborn will always be the shortest, stage 5 will always be the actual height, and the values in between are just a range in between. We don't do the same for weight since Mii weights appear to be more of a representative of underweight or overweight for the height.

        delete mii.stages[iStage].stages;//Because we're just cloning the baseline object repeatedly to make the stages a little bit cleaner, we need to clear this on subsequent clones
    }

    var foundAgeGroup=-1;
    if(hairGroupIndex<0||hairGroupIndex>9){//This selection code is for kidomatic'ing Miis that pre-exist, not for the baby generation flow.
        var foundHairIndexes=[];
        var foundAgeGroups=[];
        var foundHair=false;
        for(let iAgeGroup=3;iAgeGroup>=1&&!foundHair;iAgeGroup--){
            for(let iHairGroup=mii.general.gender===0?0:4;iHairGroup<=(mii.general.gender===0?3:9);iHairGroup++){
                if(childGenTables.hairStyleGroups[iHairGroup][iAgeGroup].includes(mii.hair.type)){
                    foundHairIndexes.push(iHairGroup);
                    foundAgeGroups.push(iAgeGroup);
                    foundHair=true;
                }
            }
        }

        if(foundHairIndexes.length>0){
            let rand=Math.floor(Math.random()*foundHairIndexes.length);
            hairGroupIndex=foundHairIndexes[rand];
            foundAgeGroup=foundAgeGroups[rand];
        }
        else{
            hairGroupIndex=childGenTables.hairStyleGroupMappings[mii.hair.type][mii.general.gender];
            foundAgeGroup=-2;
        }
    }

    //Basically there's a random chance for a hairstyle to not advance throughout the years, so it's possible to end up with a hairstyle from a younger stage. This is slightly more likely for boys than girls.
    let ageGroup = 0;
    for (let iHairStage = 0; iHairStage < 4; iHairStage++) {
        if(iHairStage==3&&foundAgeGroup!=-1) break;//If it's not -1, then it's for kidomatic'ing a pre-existing Mii and not from the baby Mii creation flow, therefore the last hair style needs to remain what the Mii already has.
        const subgroup = childGenTables.hairStyleGroups[hairGroupIndex][ageGroup];
        const hairType = subgroup[Math.floor(Math.random() * subgroup.length)];
        switch(iHairStage){
            case 0:
                mii.stages[0].hair.type = hairType;
            break;
            case 1:
                mii.stages[1].hair.type = hairType;
                mii.stages[2].hair.type = hairType;
            break;
            case 2:
                mii.stages[3].hair.type = hairType;
                mii.stages[4].hair.type = hairType;
            break;
            case 3:
                mii.stages[5].hair.type = hairType;
            break;
        }
        if (iHairStage === 0 || Math.floor(Math.random() * (mii.stages[0].general.gender === 0 ? 3 : 4)) !== 0) {//For each stage of life there is a 33% chance for boys, and a 25% chance for girls, of staying on the same hairstyle as they had already. However, they are guaranteed to never have the same hairstyle stage as their newborn stage.
            ageGroup = Math.min(ageGroup + 1, foundAgeGroup<0?3:foundAgeGroup);
        }
    }

    return mii.stages;
}

async function makeMiiChild(parentA, parentB, options) {
    let parent0,parent1;
    if(parentA.fields){
        parent0=await parentA.toJSON();
    }
    else{
        parent0=parentA;
    }
    if(parentB.fields){
        parent1=await parentB.toJSON();
    }
    else{
        parent1=parentB;
    }
    parent0=await decodeMii(parent0);
    parent1=await decodeMii(parent1);

    if(parent0.general.gender!==0){
        let tempHolder=structuredClone(parent0);
        parent0=structuredClone(parent1);
        parent1=structuredClone(tempHolder);
    }

    var randomBools = [];
    for (var i = 0; i < 8; i++) {
        //randomBools[1] is never used, kept here purely for an interesting detail from research
        randomBools.push(Math.floor(Math.random()*2));
    }

    var mainParent = randomBools[0] === 1 ? parent1 : parent0;
    var child = structuredClone(mainParent);//We have to clear some defaults doing it this way, but so much of the Mii gen is from this parent it's just cleaner to gen this way.

    //These aren't technically TL sourced but I think this is more fun/functional and doesn't change output really
    child.meta.type=(parent0.meta?.type==="Special"||parent1.meta?.type==="Special")?"Special":"Default";
    if(!child.perms) child.perms={};
    child.perms.sharing=getParentPermission(parent0,"sharing")&&getParentPermission(parent1,"sharing");
    child.perms.copying=getParentPermission(parent0,"copying")&&getParentPermission(parent1,"copying");


    var birthday=new Date();
    child.general.birthday=birthday.getDate();
    child.general.birthMonth=birthday.getMonth()+1;
    child.meta.creatorName=options?.hasOwnProperty("creatorName")?options.creatorName:"";

    var gender = options?.hasOwnProperty("gender") ? options.gender : Math.floor(Math.random() * 2);
    child.general.gender = gender;
    child.meta.name = options?.hasOwnProperty("name")? options.name : childGenTables.names[child.general.gender][Math.floor(Math.random() * childGenTables.names[child.general.gender].length)];

    var matchingParent = parent0.general.gender === gender ? parent0 : parent1;

    //Skin color mixing. Intuitively you'd think they'd order them by similarity and pick an average, but no they have an entire table of what skin colors product what child skin color

    //Backport Switch skin colors to 3DS version, just since it's table based and not an average, I'd have to extend the table to support the Switch skin colors.
    //I will probably extend the table eventually, but that's not a tangent I have time for right now. The Switch colors are not too different than the 3DS ones, so I don't think this is too lossy, and with an extended table I imagine it'd be similar or identical output.
    const parent0SkinCol=backTables.switch.faceColors[parent0.face.color];
    const parent1SkinCol=backTables.switch.faceColors[parent1.face.color];

    var validValues = childGenTables.skinColorMixing[Math.min(parent0SkinCol, parent1SkinCol)][Math.max(parent0SkinCol, parent1SkinCol)].filter(v => v !== -1);
    child.face.color = validValues[Math.floor(Math.random() * validValues.length)];

    //Each child is sorted into groups of potential hairstyles based on the hairstyle of the parent of the same gender of the child, and then a random hair is selected from that pool at each stage of life
    var hairGroupIndex = childGenTables.hairStyleGroupMappings[matchingParent.hair.type][gender];
    child.hair.color = randomBools[2] === 0 ? parent0.hair.color : parent1.hair.color;
    child.eyebrows.color = child.hair.color;

    child.face.type=matchingParent.face.type;

    child.eyes.type = randomBools[3] === 0 ? parent0.eyes.type : parent1.eyes.type;
    child.eyes.color = randomBools[4] === 0 ? parent0.eyes.color : parent1.eyes.color;

    child.eyebrows.type = matchingParent.eyebrows.type;

    child.nose.type = randomBools[5] === 0 ? parent0.nose.type : parent1.nose.type;

    child.mouth.type = randomBools[6] === 0 ? parent0.mouth.type : parent1.mouth.type;
    child.mouth.color = randomBools[7] === 0 ? parent0.mouth.color : parent1.mouth.color;

    child.mole.on = Math.floor(Math.random() * 2) === 0 ? parent0.mole.on : parent1.mole.on;

    //This should be a 1:1 of final stage height and weight generation
    var heightParent = Math.floor(Math.random() * 2) === 0 ? parent0 : parent1;
    var height = (heightParent.general.height >> 3) * 1.4;
    height *= 1.4 * 1.4;
    height *= 1.4 * 1.4;
    child.general.height = Math.round(Math.min(Math.max(height, 0), 127));

    var weightParent = Math.floor(Math.random() * 2) === 0 ? parent0 : parent1;
    let weight = Math.trunc((weightParent.general.weight + 1) / 4) + 48;
    for (var iAdj = 0; iAdj < 5; iAdj++) {
        weight += (weight - 64.0) * 0.2;
    }
    child.general.weight = Math.round(Math.min(Math.max(weight, 0), 127));

    child.general.favoriteColor=options?.favoriteColor?options.favoriteColor:(child.general.gender==0?[2,3,5,6]:[0,1,7,8])[Math.floor(Math.random()*4)];//We're not running personality generation here, so we're just making a random color of the personality groups the child had available so as to add some variety to the colors

    const childStages=await kidomatic(child,hairGroupIndex);
    return childStages;
}
export {
    kidomatic,
    makeMiiChild
}
