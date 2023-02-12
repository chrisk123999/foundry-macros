let chris = {
	'applyDamage': async function _applyDamage(tokenList, damageValue, damageType) {
		let targets;
		if (Array.isArray(tokenList)) {
			targets = new Set(tokenList);
		} else {
			targets = new Set([tokenList]);
		}
		await MidiQOL.applyTokenDamage(
			[
				{
					damage: damageValue,
					type: damageType
				}
			],
			damageValue,
			targets,
			null,
			null
		);
	},
	'checkTrait': function _checkTrait(actor, type, trait) {
		return actor.system.traits[type].value.has(trait);
	}
};
if (this.hitTargets.size != 1) return;
let damage = Math.ceil(this.damageTotal / 2);
let hasImmunity = chris.checkTrait('di', 'necrotic');
if (hasImmunity) return;
let hasResistance = chris.checkTrait('dr', 'necrotic');
if (hasResistance) damage = Math.ceil(damage / 2);
if (damage != 0) await chris.applyDamage([this.token], damage, 'healing');