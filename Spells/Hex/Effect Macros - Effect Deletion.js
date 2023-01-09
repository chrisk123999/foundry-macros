let chris = {
    'findEffect': function _findEffect(actor, name) {
        return actor.effects.find(eff => eff.label === name);
    },
    'removeEffect': async function _removeEffect(effect) {
        if (game.user.isGM) {
            await effect.delete();
        } else {
            await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': effect.parent.uuid, 'effects': [effect.id]});
        }
    }
};
let targetTokenId = effect.changes[0].value;
let targetToken = canvas.scene.tokens.get(targetTokenId);
if (!targetToken) return;
let targetActor = targetToken.actor;
let targetEffect =  chris.findEffect(targetActor, 'Hexed');
if (!targetEffect) return;
await chris.removeEffect(targetEffect);