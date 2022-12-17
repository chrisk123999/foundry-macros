if (args[0].targets.length != 1) return;
let targetToken = args[0].targets[0];
let targetActor = targetToken.actor;
let featureName = args[0].item.name;
let targetEffect = chris.findEffect(targetActor, featureName);
let appliedDamage = 0 - args[0].damageList[0].appliedDamage;
if (!targetEffect) {
    let effectData = {
		'label': featureName,
		'icon': args[0].item.img,
		'duration': {
			'seconds': 604800
		},
		'changes': [
			{
				'key': 'system.attributes.hp.tempmax',
				'mode': 2,
				'value': appliedDamage,
				'priority': 20
			}
		],
		'flags': {
			'dae': {
				'specialDuration': [
					'longRest'
				]
			}
		}
	};
	await chris.createEffect(targetActor, effectData);
} else {
    let oldAppliedDamage = ~~targetEffect.changes[0].value;
    appliedDamage += oldAppliedDamage;
    let updates = {
        '_id': targetEffect.id,
        'changes': [
			{
				'key': 'system.attributes.hp.tempmax',
				'mode': 2,
				'value': appliedDamage,
				'priority': 20
			}
		]
    };
    await chris.updateEffect(targetEffect, updates);
}
let targetMaxHP = targetActor.system.attributes.hp.max;
if (Math.abs(appliedDamage) >= targetMaxHP) {
    await chris.removeCondition(targetActor, 'Unconscious');
    await chris.addCondition(targetActor, 'Dead', true, null)
}