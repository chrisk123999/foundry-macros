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
    },
    'checkTrait': function _checkTrait(actor, type, trait) {
        return actor.system.traits[type].value.indexOf(trait) > -1;
    }
};
if (this.hitTargets.size != 1) return;
let targetToken = this.hitTargets.first();
let targetActor = targetToken.actor;
let featureName = this.item.name;
let targetEffect = chris.findEffect(targetActor, featureName);
let appliedDamage = 0 - this.damageDetail[1].damage;
let hasResistance = chris.checkTrait(targetActor, 'dr', 'necrotic');
let hasImmunity = chris.checkTrait(targetActor, 'di', 'necrotic');
if (hasImmunity) return;
if (hasResistance) appliedDamage = Math.ceil(appliedDamage / 2);
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
				'value': appliedDamage,
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
    let oldAppliedDamage = parseInt(targetEffect.changes[0].value);
    appliedDamage += oldAppliedDamage;
    let updates = {
        '_id': targetEffect.id,
        'changes': [
			{
				'key': 'system.attributes.hp.tempmax',
				'mode': 2,
				'value': appliedDamage,
				'priority': 20
			}
		]
    };
    await chris.updateEffect(targetEffect, updates);
}
let targetMaxHP = targetActor.system.attributes.hp.max;
if (Math.abs(appliedDamage) >= targetMaxHP) {
    await chris.removeCondition(targetActor, 'Unconscious');
    await chris.addCondition(targetActor, 'Dead', true, null)
}