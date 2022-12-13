let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
let actor = workflow.actor;
let oldTargetTokenId = actor.flags.world?.spell?.hex;
let oldTargetToken = canvas.scene.tokens.get(oldTargetTokenId);
let oldTargetOrigin;
let selection = 'flags.midi-qol.disadvantage.ability.check.str';
if (oldTargetToken) {
    let oldTargetActor = oldTargetToken.actor;
    let oldTargetEffect =  chris.findEffect(oldTargetActor, 'Hexed');
    if (oldTargetEffect) {
        await chris.removeEffect(oldTargetEffect);
        oldTargetOrigin = oldTargetEffect.origin;
        selection = oldTargetEffect.changes[0].key;
    }
}
let effect = chris.findEffect(actor, 'Hex');
let duration = 3600;
if (effect) duration = effect.duration.remaining;
let targetToken = workflow.targets.first();
let targetActor = targetToken.actor;
let effectData = {
	'label': 'Hexed',
	'icon': 'icons/magic/perception/silhouette-stealth-shadow.webp',
	'origin': oldTargetOrigin,
	'duration': {
		'seconds': duration
	},
	'changes': [
		{
			'key': selection,
			'mode': 5,
			'value': '1',
			'priority': 20
		}
	]
};
await chris.createEffect(targetActor, effectData);
if (effect) {
    let changes = effect.changes;
    changes[0].value = targetToken.id;
    let updates = {changes};
    await chris.updateEffect(effect, updates);
}