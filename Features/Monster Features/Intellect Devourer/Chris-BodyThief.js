if (args[0].targets.length != 1) return;
let actor = args[0].actor;
let targetActor = args[0].targets[0].actor;
let actorCheck = await actor.rollAbilityTest('int');
let targetCheck = await targetActor.rollAbilityTest('int');
if (actorCheck.total <= targetCheck.total) return;
console.log('Test');
effectData = {
	'label': 'Body Thief',
	'icon': 'icons/magic/control/energy-stream-link-spiral-teal.webp',
	'duration': {
		'seconds': 604800
	}
};
await MidiQOL.socket().executeAsGM("createEffects", {'actorUuid': targetActor.uuid, 'effects': [effectData]});