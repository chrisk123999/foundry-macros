function chris = {
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    }
};
function rollContestedCheck(actor1, actor2, skill1, skill2) {
    return game.macros.getName('Chris-ContestedCheck').execute(actor1, actor2, skill1, skill2);
}
let actor = args[0].actor;
let target = args[0].targets[0];
if (!target) return;
let targetActor = target.actor;
let spellcasting = actor.system.attributes.spellcasting;
let passed = await rollContestedCheck(actor, targetActor, spellcasting, 'str')
console.log('Passed: ' + passed);
if (!passed) return;
let effectData = {
	'label': 'Telekinetic Grab',
	'icon': 'icons/magic/earth/projectile-spiked-stone-boulder-brown.webp',
	'duration': {
		'rounds': 1
	},
	'changes': [
		{
			'key': 'macro.CE',
			'value': 'Restrained',
			'mode': 0,
			'priority': 20
		}
	]
};
await chris.createEffect(targetActor, effectData);