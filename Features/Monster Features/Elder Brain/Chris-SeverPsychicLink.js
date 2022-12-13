let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
let effect = chris.findEffect(workflow.targets.first().actor, 'Psychic Link');
if (!effect) return;
await chris.removeEffect(effect);