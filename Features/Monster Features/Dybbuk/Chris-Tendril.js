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
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let featureName = this.item.name;
let targetEffect = chris.findEffect(targetActor, featureName);
let damageRoll = await new Roll('1d6').roll({async: true});
damageRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: this.item.name
});
let hpReductionTotal = -damageRoll.total;
if (!targetEffect) {
    let effectData = {
		'label': featureName,
		'icon': this.item.img,
		'duration': {
			'seconds': 604800
		},
		'changes': [
			{
				'key': 'system.attributes.hp.tempmax',
				'mode': 2,
				'value': hpReductionTotal,
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
	await chris.createEffect(targetActor, effectData);
} else {
    let oldAppliedDamage = Number(targetEffect.changes[0].value);
    hpReductionTotal += oldAppliedDamage;
    let updates = {
        '_id': targetEffect.id,
        'changes': [
			{
				'key': 'system.attributes.hp.tempmax',
				'mode': 2,
				'value': hpReductionTotal,
				'priority': 20
			}
		]
    };
    await chris.updateEffect(targetEffect, updates);
}
let targetMaxHP = targetActor.system.attributes.hp.max;
if (Math.abs(hpReductionTotal) >= targetMaxHP) {
    await chris.removeCondition(targetActor, 'Unconscious');
    await chris.addCondition(targetActor, 'Dead', true, null)
}