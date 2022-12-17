if (args[0].targets.length != 1) return;
let amplify = await chris.dialog('Amplify Blood Curse?', [['Yes', true], ['No', false]]);
if (!amplify) return;
let damageDice = actor.system.scale['blood-hunter']['crimson-rite'];
let roll = await new Roll(damageDice + '[necrotic]').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Blood Curse of the Fallen Puppet'
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
let effect = chris.findEffect(targetActor, 'Blood Curse of the Fallen Puppet');
if (!effect) return;
let wisMod = args[0].actor.system.abilities.wis.mod;
let updates = {
    'changes': [
        {
            'key': 'system.bonuses.All-Attacks',
            'mode': 2,
            'priority': 20,
            'value': '+' + wisMod
        }
    ]
};
await chris.updateEffect(effect, updates);