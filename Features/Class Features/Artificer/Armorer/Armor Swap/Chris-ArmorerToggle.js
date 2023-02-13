let effect = actor.effects.find(eff => eff.label === 'Arcane Armor: Infiltrator Model');
let feature;
if (effect) {
	feature = this.actor.items.getName('Arcane Armor: Guardian Model');
} else {
	feature = this.actor.items.getName('Arcane Armor: Infiltrator Model');
}
if (!feature) return;
await feature.use();