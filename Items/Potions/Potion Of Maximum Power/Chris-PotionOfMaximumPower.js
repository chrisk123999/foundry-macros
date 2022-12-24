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
if (this.targets.size === 0) return;
if (this.item.type != 'spell') return;
if (this.castData.castLevel > 4) return;
let oldDamageRoll = this.damageRoll;
let newDamageRoll = '';
for (let i = 0; oldDamageRoll.terms.length > i; i++) {
        let flavor = oldDamageRoll.terms[i].flavor;
        let isDeterministic = oldDamageRoll.terms[i].isDeterministic;
        if (isDeterministic === true) {
            newDamageRoll += oldDamageRoll.terms[i].formula;
        } else {
            newDamageRoll += '(' + oldDamageRoll.terms[i].number + '*' + oldDamageRoll.terms[i].faces + ')[' + flavor + ']';
        }
}
let roll = await new Roll(newDamageRoll).roll({async: true});
await this.setDamageRoll(roll);
let effect = chris.findEffect(this.actor, 'Potion of Maximum Power');
if (!effect) return;
await chris.removeEffect(effect);