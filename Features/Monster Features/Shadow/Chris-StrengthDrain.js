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
	},
	'removeCondition': async function _removeCondition(actor, name) {
		await game.dfreds.effectInterface.removeEffect(
			{
				'effectName': name,
				'uuid': actor.uuid
			}
		);
	}
};
if (this.hitTargets.size != 1) return;
let roll = await new Roll('1d4').roll({async: true});
roll.toMessage({
	rollMode: 'roll',
	speaker: {alias: name},
	flavor: 'Strength Drain'
});
let targetToken = this.hitTargets.first();
let targetActor = targetToken.actor;
let targetEffect = chris.findEffect(targetActor, 'Strength Drain');
if (!targetEffect) {
	let effectData = {
		'label': 'Strength Drain',
		'icon': 'icons/skills/wounds/injury-hand-blood-red.webp',
		'duration': {
			'seconds': 604800
		},
		'origin': this.item.uuid,
		'changes': [
			{
				'key': 'system.abilities.str.value',
				'mode': 2,
				'value': -roll.total,
				'priority': 20
			}
		],
		'flags': {
			'dae': {
				'specialDuration': [
					'longRest',
					'shortRest'
				]
			}
		}
	};
	await chris.createEffect(targetActor, effectData);
} else {
	let changes = targetEffect.changes;
	changes[0].value -= roll.total;
	let updates = {changes};
	await chris.updateEffect(targetEffect, updates);
}
let targetStrength = targetActor.system.abilities.str.value;
if (targetStrength <= 0) {
	await chris.removeCondition(targetActor, 'Unconscious');
	await chris.addCondition(targetActor, 'Dead', true, null);
}