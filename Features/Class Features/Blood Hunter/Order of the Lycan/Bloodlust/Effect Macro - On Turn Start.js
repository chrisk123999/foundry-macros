if ((actor.system.attributes.hp.max / 2) < actor.system.attributes.hp.value) return;
let feature = actor.items.getName('Hybrid Transformation Features: Bloodlust');
if (!feature) return;
await feature.roll();