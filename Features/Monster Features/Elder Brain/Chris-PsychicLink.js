let workflow = args[0].workflow;
if (workflow.saveResults.length === 0) return;
if (workflow.failedSaves.size === 1) return;
console.log(workflow);
let actor = workflow.actor;
let effect = chris.findEffect(actor, 'Psychic Link');
if (!effect) return;
let roll = await new Roll('3d6[psychic]').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Psychic Link'
});
await chris.removeEffect(effect);
await chris.applyDamage(workflow.token, roll.total, 'psychic');