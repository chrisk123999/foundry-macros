let chris = {
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    }
};
if (this.targets.size != 1) return;
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let roll = await new Roll('1d4').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Potion of Growth'
});
let effectData = {
	'label': 'Potion of Growth',
	'icon': 'icons/consumables/potions/potion-tube-corked-bubbling-green.webp',
	'duration': {
		'seconds': 3600 * roll.total
	},
	'changes': [
	    {
	        'key': 'system.bonuses.mwak.damage',
	        'mode': 2,
	        'priority': 20,
	        'value': '+1d4'
	    },
	    {
	        'key': 'system.bonuses.rwak.damage',
	        'mode': 2,
	        'priority': 20,
	        'value': '+1d4'
	    },
	    {
	        'key': 'ATL.height',
	        'mode': 5,
	        'priority': 20,
	        'value': targetToken.document.height + 1
	    },
	    {
	        'key': 'ATL.width',
	        'mode': 5,
	        'priority': 20,
	        'value': targetToken.document.width + 1
	    }
    ]
};
await chris.createEffect(targetActor, effectData);