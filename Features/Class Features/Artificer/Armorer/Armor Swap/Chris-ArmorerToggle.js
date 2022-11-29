let effect = actor.effects.find(eff => eff.label === 'Arcane Armor: Infiltrator Model');
let feature;
if (effect) {
    feature = args[0].actor.items.getName('Arcane Armor: Guardian Model');
} else {
    feature = args[0].actor.items.getName('Arcane Armor: Infiltrator Model');
}
if (!feature) return;
feature.roll();