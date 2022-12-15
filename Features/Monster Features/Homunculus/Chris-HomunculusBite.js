function chris = {
    'findEffect': function _findEffect(actor, name) {
        return actor.effects.find(eff => eff.label === name);
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
if (args[0].workflow.hitTargets.size != 1) return;
let saveResult = args[0].workflow.saveResults[0].total;
let saveDC = args[0].item.system.save.dc;
if (saveDC - saveResult < 5) return;
let effect = chris.findEffect(args[0].targets[0].actor, 'Poisoned Bite');
if (!effect) return;
let roll = await new Roll('1d10').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Poisoned Bite'
});
let seconds = roll.total * 60;
let updates = {
    'duration': {
        'seconds': seconds
    }
};
await chris.updateEffect(effect, updates);
await chris.addCondition(args[0].targets[0].actor, 'Unconscious', false, args[0].item.uuid);