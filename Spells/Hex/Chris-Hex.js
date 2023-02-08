let chris = {
    'dialog': async function _dialog(title, options) {
        let buttons = options.map(([label,value]) => ({label,value}));
        let selected = await warpgate.buttonDialog(
            {
                buttons,
                title,
            },
            'column'
        );
        return selected;
    },
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
    'removeEffect': async function _removeEffect(effect) {
        if (game.user.isGM) {
            await effect.delete();
        } else {
            await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': effect.parent.uuid, 'effects': [effect.id]});
        }
    },
    'updateEffect': async function _updateEffect(effect, updates) {
        if (game.user.isGM) {
            await effect.update(updates);
        } else {
            updates._id = effect.id;
            await MidiQOL.socket().executeAsGM('updateEffects', {'actorUuid': effect.parent.uuid, 'updates': [updates]});
        }
    }
};
if (this.targets.size != 1) return;
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let effect = chris.findEffect(targetActor, 'Hexed');
if (effect) await chris.removeEffect(effect);
let selection = await chris.dialog('What ability should have disadvantage?', [
    ['Strength', 'str'],
    ['Dexterity', 'dex'],
    ['Constitution', 'con'],
    ['Intelligence', 'int'],
    ['Wisdom', 'wis'],
    ['Charisma', 'cha']
]);
if (!selection) selection = 'str';
let castLevel = this.castData.castLevel;
let seconds;
switch (castLevel) {
    case 3:
    case 4:
        seconds = 28800;
        break;
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
        seconds = 86400;
        break;
    default:
        seconds = 3600;
}
let effectData = {
	'label': 'Hexed',
	'icon': 'icons/magic/perception/silhouette-stealth-shadow.webp',
	'origin': this.item.uuid,
	'duration': {
		'seconds': seconds
	},
	'changes': [
		{
			'key': 'flags.midi-qol.disadvantage.ability.check.' + selection,
			'mode': 5,
			'value': '1',
			'priority': 20
		}
	]
};
await chris.createEffect(targetActor, effectData);
let sourceActor = this.actor;
let sourceEffect = chris.findEffect(sourceActor, 'Hex');
if (!sourceEffect) return;
let changes = sourceEffect.changes;
changes[0].value = targetToken.id;
let updates = {
    changes,
    'duration': {
        'seconds': seconds
    }
};
await chris.updateEffect(sourceEffect, updates);
let conEffect = chris.findEffect(sourceActor, 'Concentrating');
if (conEffect) {
    let updates = {
        'duration': {
            'seconds': seconds
        }
    };
    await chris.updateEffect(conEffect, updates);
}