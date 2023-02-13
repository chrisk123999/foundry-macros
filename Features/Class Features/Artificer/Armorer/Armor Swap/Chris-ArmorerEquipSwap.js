let effect;
let doLateUpdate = false;
async function lateUpdate () {
	await warpgate.wait(2000);
	let fieldUses = await this.actor.getFlag('world', 'feature.defensiveField');
	if (!fieldUses) fieldUses = this.actor.system.attributes.prof;
	let fieldItem = this.actor.items.getName('Guardian Armor: Defensive Field');
	if (fieldItem) await fieldItem.update({
		'system.uses.value': fieldUses,
		'system.uses.max': this.actor.system.attributes.prof
	});
}
switch (this.item.name) {
	case 'Arcane Armor: Guardian Model':
		effect = this.actor.effects.find(eff => eff.label === 'Arcane Armor: Infiltrator Model');
		doLateUpdate = true;
		break;
	case 'Arcane Armor: Infiltrator Model':
		effect = this.actor.effects.find(eff => eff.label === 'Arcane Armor: Guardian Model');
		let defensiveFieldItem = this.actor.items.getName('Guardian Armor: Defensive Field');
		if (defensiveFieldItem) this.actor.setFlag('world', 'feature.defensiveField', defensiveFieldItem.system.uses.value);
		break;
}
if (effect) effect.delete();
if (doLateUpdate) lateUpdate();