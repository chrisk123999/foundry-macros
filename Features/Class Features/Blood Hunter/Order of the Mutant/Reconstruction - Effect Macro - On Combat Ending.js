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
let profBonus = actor.system.attributes.prof;
let healAmount = 0;
let count = 0;
while ((currentHP +  healAmount) < (maxHP / 2)) {
	healAmount += profBonus;
	count += 1;
	if (count === 99) break;
}
await applyDamage(healAmount, 'healing', [token]);