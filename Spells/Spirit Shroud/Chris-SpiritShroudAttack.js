let chris = {
	'findEffect': function _findEffect(actor, name) {
		return actor.effects.find(eff => eff.label === name);
	}
};
if (this.hitTargets.size != 1) return;
let validAttacks = ['mwak', 'rwak', 'msak', 'rsak'];
if (!validAttacks.includes(this.item.system.actionType)) return;
let distance = MidiQOL.getDistance(this.token, this.targets.first(), {wallsBlock: false});
if (distance > 10) return;
let effect = chris.findEffect(this.actor, 'Spirit Shroud');
if (!effect) return;
let castLevel = effect.flags['midi-qol'].castData.castLevel;
let damageType = effect.flags.world?.spell?.spiritShroud;
if (!damageType) damageType = 'necrotic';
let diceNum;
switch (castLevel) {
	case 3:
	case 4:
		diceNum = 1;
		break;
	case 5:
	case 6:
		diceNum = 2;
		break;
	case 7:
	case 8:
		diceNum = 3;
		break;
	case 9:
		diceNum = 4;
		break;
}
if (this.isCritical) diceNum = diceNum * 2;
let oldFormula = this.damageRoll._formula;
let damageFormula = oldFormula + ' + ' + diceNum + 'd8[' + damageType + ']';
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);