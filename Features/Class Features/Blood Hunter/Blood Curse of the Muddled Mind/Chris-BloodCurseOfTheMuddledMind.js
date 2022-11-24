function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
function updateEffect(tokenid, effectid, updates) {
    return game.macros.getName('Chris-UpdateEffect').execute(tokenid, effectid, updates);
}
if (args[0].targets.length != 1) return;
let amplify = await showMenu('Amplify Blood Curse?', [['Yes', true], ['No', false]]);
if (!amplify) return;
let damageDice = actor.system.scale['blood-hunter']['crimson-rite'];
let roll = await new Roll(damageDice + '[necrotic]').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Blood Curse of the Muddled Mind'
});
let tokenDoc = args[0].workflow.token.document;
await MidiQOL.applyTokenDamage(
    [
        {
            'damage': roll.total,
            'type': 'necrotic'
        }
    ],
    roll.total,
    new Set([tokenDoc]),
    null,
    null
);
let targetActor = args[0].targets[0].actor;
let effect = targetActor.effects.find(eff => eff.label === 'Blood Curse of the Muddled Mind');
if (!effect) return;
let updates = {
    'duration': {
        'duration': 6,
        'label': '6 Seconds',
        'remaining': 6,
        'rounds': 1,
        'seconds': 6
    },
    'flags': {
        'dae': {
            'specialDuration': []
        }
    }
};

let targetToken = args[0].targets[0];
await updateEffect(targetToken.id, effect.id, updates);