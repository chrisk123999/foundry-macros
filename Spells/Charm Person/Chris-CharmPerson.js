let chris = {
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    }
};
if (args[0].targets.length === 0) return;
let effectData = {
	'label': 'Condition Advantage',
	'icon': 'icons/magic/time/arrows-circling-green.webp',
	'duration': {
		'turns': 1
	},
	'changes': [
		{
			'key': 'flags.midi-qol.advantage.ability.save.all',
			'value': '1',
			'mode': 5,
			'priority': 120
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
for (let i = 0; args[0].targets.length > i; i++) {
    await chris.createEffect(args[0].targets[i].actor, effectData);
}