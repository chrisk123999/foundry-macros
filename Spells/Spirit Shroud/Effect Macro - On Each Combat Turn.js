let chris = {
	'createEffect': async function _createEffect(actor, effectData) {
		if (game.user.isGM) {
			await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
		} else {
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
		}
	},
	'findNearby': function _findNearby(tokenDoc, range, disposition) {
		let dispositionValue;
		switch (disposition) {
			case 'ally':
				dispositionValue = 1;
				break;
			case 'neutral':
				dispositionValue = 0;
				break;
			case 'enemy':
				dispositionValue = -1;
				break;
			default:
				dispositionValue = null;
		}
		return MidiQOL.findNearby(dispositionValue, tokenDoc, range);
	}
};
let targetTokens = chris.findNearby(token, 10, 'enemy');
if (targetTokens.length === 0) return;
let targetToken =  targetTokens.find(i => i.id === game.combat.current.tokenId);
if (!targetToken) return;
let effectData = {
	'label': 'Spirit Shroud - Slow',
	'icon': origin.img,
	'origin': origin.actor.uuid,  //Not item Uuid to prevent AA from killing the animation on the source actor.
	'duration': {
		'rounds': 1
	},
	'changes': [
		{
			'key': 'system.attributes.movement.all',
			'mode': 0,
			'value': '-10',
			'priority': 20
		}
	],
	'flags': {
		'dae': {
			'transfer': false,
			'specialDuration': [
				'turnStartSource'
			],
			'stackable': 'multi',
			'macroRepeat': 'none'
		}
	}
}
await chris.createEffect(targetToken.actor, effectData);