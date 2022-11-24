function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
if (args[0].hitTargets.length != 1) return;
let selectedOption = await showMenu('Activate Grovelthrash?', [['Yes', true], ['No', false]]);
if (!selectedOption) return;
let damageDiceNum = 2;
if (args[0].isCritical === true) damageDiceNum = damageDiceNum * 2;
let damageDice = damageDiceNum + 'd6[bludgeoning]';
let workflow = args[0].workflow;
let damageFormula = workflow.damageRoll.formula + ' + ' + damageDice;
workflow.damageRoll = await new Roll(damageFormula).roll({async: true});
workflow.damageTotal = workflow.damageRoll.total;
workflow.damageRollHTML = await workflow.damageRoll.render();
let selfDamageFormula = '1d6[psychic]';
let selfDamageRoll = await new Roll(selfDamageFormula).roll({async: true});
selfDamageRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Grovelthrash'
});
await MidiQOL.applyTokenDamage(
    [
        {
            damage: selfDamageRoll.total,
            type: 'psychic'
        }
    ],
    selfDamageRoll.total,
    new Set([workflow.token]),
    null,
    null
);