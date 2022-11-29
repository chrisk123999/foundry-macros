if (args[0].failedSaves.length != 1) return;
let roll = await new Roll('3d6').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Devour Intellect'
});
let targetActor = args[0].failedSaves[0].actor;
if (targetActor.system.abilities.int.value > roll.total) return;
effectData = {
	'label': 'Devoured Intellect',
	'icon': 'icons/commodities/biological/mouth-toothed-purple.webp',
	'duration': {
		'seconds': 604800
	},
	'changes': [
		{
			'key': 'system.abilities.int.value',
			'mode': 3,
			'value': '0',
			'priority': 20
		},
        {
			  "key": "macro.CE",
			  "mode": 0,
			  "value": "Stunned",
			  "priority": 20
        }
	]
};
await MidiQOL.socket().executeAsGM("createEffects", {'actorUuid': targetActor.uuid, 'effects': [effectData]});