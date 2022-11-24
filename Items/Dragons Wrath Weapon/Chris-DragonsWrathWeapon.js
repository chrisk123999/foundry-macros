if (args[0].hitTargets.length != 1) return;
if (args[0].attackD20 != 20) return;
let sequencerFile = 'modules/jb2a_patreon/Library/2nd_Level/Misty_Step/MistyStep_01_Regular_Blue_400x400.webm';
new Sequence().wait(1250).effect().file(sequencerFile).atLocation(args[0].hitTargets[0].id).belowTokens(true).play();
let targetToken = args[0].workflow.hitTargets.first();
let nearbyTargets = MidiQOL.findNearby(1, targetToken, 5, null);
let damageType = args[0].item.system.damage.parts[1][1];
await MidiQOL.applyTokenDamage(
    [
        {
            damage: 5,
            type: damageType
        }
    ],
    5,
    new Set(nearbyTargets),
    args[0].item,
    null
);