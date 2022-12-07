let itemName = args[1];
let actor = args[0][0].actor;
let itemFeature = await actor.items.getName(itemName);
if (!itemFeature) return;
let usesMax = itemFeature.system.uses.max;
await itemFeature.update({
    'system.uses.value': usesMax
});