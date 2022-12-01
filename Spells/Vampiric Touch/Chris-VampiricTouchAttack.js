function checkTrait(type, trait) {
	return args[0].hitTargets[0].actor.system.traits[type].value.indexOf(trait) > -1;
}
if (args[0].hitTargets.length != 1) return;
let damage = Math.ceil(args[0].damageTotal / 2);
let hasImmunity = checkTrait('di', 'necrotic');
if (hasImmunity) return;
let hasResistance = checkTrait('dr', 'necrotic');
if (hasResistance) damage = Math.ceil(damage / 2);
if (damage != 0) {
	let sourceToken = args[0].workflow.token.document;
	await MidiQOL.applyTokenDamage([{damage: damage, type: 'healing' }], damage, new Set([sourceToken]), null, null);
}