let feature = actor.items.getName('Blood Maledict');
if (!feature) return;
await feature.update({
    'system.uses.max': feature.system.uses.max - 1
});