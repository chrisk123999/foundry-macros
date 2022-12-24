let chris = {
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
    'applyDamage': async function _applyDamage(tokenList, damageValue, damageType) {
        let targets;
        if (Array.isArray(tokenList)) {
            targets = new Set(tokenList);
        } else {
            targets = new Set([tokenList]);
        }
        await MidiQOL.applyTokenDamage(
            [
                {
                    damage: damageValue,
                    type: damageType
                }
            ],
            damageValue,
            targets,
            null,
            null
        );
    }
};
if (this.targets.size != 1) return;
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let effect = chris.findEffect(targetActor, 'Potion of Giant Size');
if (!effect) return;
let changes = effect.changes;
changes[3].value = targetActor.system.attributes.hp.max * 2;
let updates = {changes};
await chris.updateEffect(effect, updates);
await chris.applyDamage(targetToken, targetActor.system.attributes.hp.value * 2, 'healing');