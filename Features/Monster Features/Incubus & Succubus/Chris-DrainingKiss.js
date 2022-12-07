if (args[0].failedSaves.length != 1) return;
let targetToken = args[0].failedSaves[0];
let targetActor = targetToken.actor;
let targetEffect = targetActor.effects.find(eff => eff.label === 'Draining Kiss');
let appliedDamage = 0 - args[0].damageList[0].appliedDamage;
if (!targetEffect) {
    let effectData = {
		'label': 'Draining Kiss',
		'icon': 'icons/magic/air/wind-vortex-swirl-purple.webp',
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
	await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [effectData]});
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
    await MidiQOL.socket().executeAsGM('updateEffects', {'actorUuid': targetActor.uuid, 'updates': [updates]});
}
let targetMaxHP = targetActor.system.attributes.hp.max;
if (Math.abs(appliedDamage) >= targetMaxHP) {
    await game.dfreds.effectInterface.removeEffect(
        {
            'effectName': 'Unconscious',
            'uuid': targetActor.uuid
        }
    );
    await game.dfreds.effectInterface.addEffect(
        {
            'effectName': 'Dead',
            'uuid': targetActor.uuid,
            'origin': args[0].item.uuid,
            'overlay': true
        }
    );
}