if (this.hitTargets.size != 1) return;
if (this.isFumble) return;
let item = this.item;
let doExtraDamage = false;
if (game.combat === null || game.combat === undefined) {
    doExtraDamage = true;
} else {
    let token = this.token;
    if (token.id != game.combat.current.tokenId) return;
    let currentTurn = game.combat.round + '-' + game.combat.turn;
    let previousTurn = item.flags.world?.feature?.lightningLauncher.turn;
    if (!previousTurn || previousTurn != currentTurn) doExtraDamage = true;
    await item.setFlag('world', 'feature.lightningLauncher.turn', currentTurn);
}
if (doExtraDamage) {
    let diceNumber = 1;
    if (this.isCritical) diceNumber = 2;
    let damageFormula = this.damageRoll._formula + ' + ' + diceNumber + 'd6[lightning]';
    this.damageRoll = await new Roll(damageFormula).roll({async: true});
    this.damageTotal = this.damageRoll.total;
    this.damageRollHTML = await this.damageRoll.render();
}