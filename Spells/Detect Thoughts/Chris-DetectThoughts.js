let chris = {
    'removeEffect': async function _removeEffect(effect) {
        if (game.user.isGM) {
            await effect.delete();
        } else {
            await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': effect.parent.uuid, 'effects': [effect.id]});
        }
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
let effect = chris.findEffect(this.actor, 'Detect Thoughts');
if (!effect) return;
await chris.removeEffect(effect);
await chris.removeCondition(this.actor, 'Concentrating');