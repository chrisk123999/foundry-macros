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
let validTypes = ['msak', 'rsak', 'mwak', 'rwak'];
if (!validTypes.includes(this.item.system.actionType)) return;
let feature = this.actor.items.getName('Form of Dread');
if (!feature) return;
let currentTurn = '';
let doCheck = false;
if (game.combat === null || game.combat === undefined) {
    doCheck = true;
} else {
    if (this.token.id != game.combat.current.tokenId) return;
    currentTurn = game.combat.round + '-' + game.combat.turn;
    let previousTurn = this.item.flags.world?.feature?.fod?.turn;
    if (!previousTurn || previousTurn != currentTurn) doCheck = true;
}
if (!doCheck) return;
let selection = await chris.dialog('Attempt to fear target?', [['Yes', true], ['No', false]]);
if (!selection) return;
await this.item.setFlag('world', 'feature.fod.turn', currentTurn);
await feature.roll();