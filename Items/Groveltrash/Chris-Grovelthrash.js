window.chris = {
	'dialog': async function _dialog(title, options) {
		let buttons = options.map(([label,value]) => ({label,value}));
		let selected = await warpgate.buttonDialog(
			{
				buttons,
				title,
			},
			'column'
		);
		return selected;
	},
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
	}
};
if (this.hitTargets.size != 1) return;
let selectedOption = await chris.dialog('Activate Grovelthrash?', [['Yes', true], ['No', false]]);
if (!selectedOption) return;
let damageDiceNum = 2;
if (this.isCritical) damageDiceNum = damageDiceNum * 2;
let damageDice = damageDiceNum + 'd6[bludgeoning]';
let damageFormula = this.damageRoll._formula + ' + ' + damageDice;
this.damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);
let selfDamageFormula = '1d6[psychic]';
let selfDamageRoll = await new Roll(selfDamageFormula).roll({async: true});
selfDamageRoll.toMessage({
	rollMode: 'roll',
	speaker: {alias: name},
	flavor: this.item.name
});
await chris.applyDamage([this.token], selfDamageRoll.total, 'psychic');