let chris = {
	'findEffect': function _findEffect(actor, name) {
		return actor.effects.find(eff => eff.label === name);
	},
	'createEffect': async function _createEffect(actor, effectData) {
		if (game.user.isGM) {
			await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
		} else {
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
		}
	},
	'updateEffect': async function _updateEffect(effect, updates) {
		if (game.user.isGM) {
			await effect.update(updates);
		} else {
			updates._id = effect.id;
			await MidiQOL.socket().executeAsGM('updateEffects', {'actorUuid': effect.parent.uuid, 'updates': [updates]});
		}
	},
	'addCondition': async function _addCondition(actor, name, overlay, origin) {
		await game.dfreds.effectInterface.addEffect(
			{
				'effectName': name,
				'uuid': actor.uuid,
				'origin': origin,
				'overlay': overlay
			}
		);
	}
};
if (this.failedSaves.size != 1) return;
let diceSize = '1d4';
let targetActor = this.targets.first().actor;
let effect = chris.findEffect(targetActor,'Eat Memories');
if (effect) {
	diceSize = effect.changes[0].value;
	switch (diceSize) {
		case '1d4':
			diceSize = '1d6';
			break;
		case '1d6':
			diceSize = '1d8';
			break;
		case '1d8':
			diceSize = '1d10';
			break;
		case '1d10':
			diceSize = '1d12';
			break;
		case '1d12':
			diceSize = '1d20';
			break;
		case '1d20':
			let condition = chris.findEffect(targetActor, 'Unconscious');
			if (!condition) await chris.addCondition(targetActor, 'Unconscious', false, this.item.uuid);
			return;
	}
	let changes = effect.changes;
	changes[0].value = diceSize;
	changes[1].value = '-' + diceSize;
	changes[2].value = '-' + diceSize;
	await chris.updateEffect(effect, {changes});
} else {
	let effectData = {
		'label': this.item.name,
		'icon': this.item.img,
		'origin': this.item.uuid,
		'duration': {
			'seconds': 604800
		},
		'changes': [
			{
				'key': 'flags.world.feature.eatmemories',
				'mode': 5,
				'value': diceSize,
				'priority': 20
			},
			{
				'key': 'system.bonuses.All-Attacks',
				'mode': 2,
				'value': '-' + diceSize,
				'priority': 20
			},
			{
				'key': 'system.bonuses.abilities.check',
				'mode': 2,
				'value': '-' + diceSize,
				'priority': 20
			}
		],
		'flags': {
			'dae': {
				'transfer': false,
				'specialDuration': [
					'longRest',
					'shortRest'
				],
				'stackable': 'multi',
				'macroRepeat': 'none'
			}
		}
	};
	await chris.createEffect(targetActor, effectData);
}