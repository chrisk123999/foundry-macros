if (args[0].targets.length === 0) return;
let effectData = {
	'label': 'Condition Advantage',
	'icon': 'icons/magic/time/arrows-circling-green.webp',
	'duration': {
		'turns': 1
	},
	'changes': [
		{
			'key': 'flags.midi-qol.magicResistance.all',
			'value': '1',
			'mode': 2,
			'priority': 20
		}
	],
	'flags': {
		'dae': {
			'specialDuration': [
				'isSave'
			]
		}
	}
};
async function addEffect (actorUuid) {
    await MidiQOL.socket().executeAsGM("createEffects", {'actorUuid': actorUuid, 'effects': [effectData]});
}
for (let i = 0; args[0].targets.length > i; i++) {
    await addEffect(args[0].targets[i].actor.uuid);
}