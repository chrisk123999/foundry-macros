function applyDamage(damage, damageType, targets) {
	await MidiQOL.applyTokenDamage(
		[
			{
				damage: damage,
				type: damageType
			}
		],
		damage,
		new Set(targets),
		null,
		null
	);
}
let currentHP = actor.system.attributes.hp.value;
let maxHP = actor.system.attributes.hp.max;
if (currentHP < (maxHP / 2)) {
	let profBonus = actor.system.attributes.prof;
	await applyDamage(profBonus, 'healing', [token]);
}