let actor = args[0].actor;
let feature = await actor.items.getName('Ki Points');
if (!feature) return;
let diceForumula = actor.system.scale.monk['martial-arts'];
if (!diceForumula) return;
let diceRoll = await new Roll(diceForumula).roll({async: true});
diceRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name}
});
let rollTotal = diceRoll.total;
let featureUseTotal = feature.system.uses.max;
let featureUses = Math.clamped(feature.system.uses.value + rollTotal, 0, featureUseTotal);
await feature.update({'system.uses.value': featureUses});