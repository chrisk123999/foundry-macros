let feature = args[0].actor.items.getName('Blood Maledict');
if (!feature) return;
await feature.update({
    'system.uses.value': feature.system.uses.value + 1,
    'system.uses.max': feature.system.uses.max + 1
});