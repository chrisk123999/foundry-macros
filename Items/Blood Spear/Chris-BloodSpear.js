if (this.hitTargets.size != 1) return;
let newHP = this.damageList[0].newHP;
let oldHP = this.damageList[0].oldHP;
if (newHP === 0 && oldHP != 0) {
	let damageRoll = await new Roll('2d6[temphp]').roll({async: true});
	damageRoll.toMessage({
	rollMode: 'roll',
	speaker: {alias: name},
	flavor: this.item.name
});
	await MidiQOL.applyTokenDamage(
	[
		{
			damage: damageRoll.total,
			type: 'temphp'
		}
	],
	damageRoll.total,
	new Set([this.token]),
	this.item,
	null
);
}