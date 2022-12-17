let workflow = args[0].workflow;
if (workflow.hitTargets.size != 1) return;
let roll = await new Roll('1d4').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Strength Drain'
});
let targetToken = workflow.hitTargets.first();
let targetActor = targetToken.actor;
let targetEffect = chris.findEffect(targetActor, 'Strength Drain');
if (!targetEffect) {
    let effectData = {
		'label': 'Strength Drain',
		'icon': 'icons/skills/wounds/injury-hand-blood-red.webp',
		'duration': {
			'seconds': 604800
		},
		'origin': workflow.item.uuid,
		'changes': [
			{
				'key': 'system.abilities.str.value',
				'mode': 2,
				'value': -roll.total,
				'priority': 20
			}
		],
		'flags': {
			'dae': {
				'specialDuration': [
					'longRest',
					'shortRest'
				]
			}
		}
	};
	await chris.createEffect(targetActor, effectData);
} else {
    let changes = targetEffect.changes;
    changes[0].value -= roll.total;
    let updates = {changes};
    await chris.updateEffect(targetEffect, updates);
}
let targetStrength = targetActor.system.abilities.str.value;
if (targetStrength <= 0) {
    await chris.removeCondition(targetActor, 'Unconscious');
    await chris.addCondition(targetActor, 'Dead', true, null);
}