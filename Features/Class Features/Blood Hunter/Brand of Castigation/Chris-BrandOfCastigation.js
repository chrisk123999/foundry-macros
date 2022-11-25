if (args[0].hitTargets.length != 1) return;
let actor = args[0].actor;
let damage = actor.flags.world?.feature?.bas?.damage;
let featureToken = actor.flags.world?.feature?.bas?.tokenid;
let applySelfDamage = false;
let targetToken = args[0].workflow.hitTargets.first();
if (!targetToken) return;
console.log(targetToken);
if (targetToken.id === featureToken) {
    applySelfDamage = true;
} else {
    let nearbyTargets = MidiQOL.findNearby(null, targetToken, 5, null);
    for (let i = 0; nearbyTargets.length > i; i++) {
        if (nearbyTargets[i].id === featureToken) {
            applySelfDamage = true;
            break;
        }
    }
}
if (!applySelfDamage) return;
let selfToken = args[0].workflow.token.document;
await MidiQOL.applyTokenDamage(
    [
        {
            damage: damage,
            type: 'psychic'
        }
    ],
    damage,
    new Set([selfToken]),
    null,
    null
);