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
    }
};
if (this.hitTargets.size != 1) return;
if (this.defaultDamageType != 'necrotic') return;
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
let extraDice = '+ 1d' + this.damageRoll.dice[0].faces + '[necrotic]';
let damageFormula = this.damageRoll._formula + extraDice;
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);