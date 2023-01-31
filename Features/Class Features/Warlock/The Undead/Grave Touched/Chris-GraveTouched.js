let chris = {
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
	'findEffect': function _findEffect(actor, name) {
        return actor.effects.find(eff => eff.label === name);
    }
};
if (this.hitTargets.size != 1) return;
let validTypes = ['msak', 'rsak', 'mwak', 'rwak'];
if (!validTypes.includes(this.item.system.actionType)) return;
let feature = this.actor.items.getName('Grave Touched');
if (!feature) return;
let currentTurn = '';
let doCheck = false;
if (game.combat === null || game.combat === undefined) {
    doCheck = true;
} else {
    if (this.token.id != game.combat.current.tokenId) return;
    currentTurn = game.combat.round + '-' + game.combat.turn;
    let previousTurn = feature.flags.world?.feature?.gt?.turn;
    if (!previousTurn || previousTurn != currentTurn) doCheck = true;
}
if (!doCheck) return;
let selection = await chris.dialog('Use Grave Touched?', [['Yes', true], ['No', false]]);
if (!selection) return;
await feature.setFlag('world', 'feature.gt.turn', currentTurn);
let oldDamageRoll = this.damageRoll;
let newDamageRoll = '';
for (let i = 0; oldDamageRoll.terms.length > i; i++) {
	let flavor = oldDamageRoll.terms[i].flavor;
	let isDeterministic = oldDamageRoll.terms[i].isDeterministic;
	if (isDeterministic === true) {
		newDamageRoll += oldDamageRoll.terms[i].expression;
	} else {
		newDamageRoll += oldDamageRoll.terms[i].number + 'd' + oldDamageRoll.terms[i].faces + '[necrotic]';
	}
}
let damageFormula = newDamageRoll;
let effect = chris.findEffect(this.actor, 'Form of Dread: Transform');
if (effect) {
    let diceNum = 1;
    if (this.isCritical) diceNum = 2;
    let extraDice = '+ ' + diceNum + 'd' + this.damageRoll.dice[0].faces + '[necrotic]';
    damageFormula = newDamageRoll + extraDice;
}
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);