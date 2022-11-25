if (this.hitTargets.size != 1) return;
let attackType = this.item.system.actionType;
if (!(attackType === 'msak' || attackType === 'mwak')) return;
let effect = this.actor.effects.find(eff => eff.label === 'Burning Aura');
let originItem = await fromUuid(effect.origin);
let originActor = originItem.actor;
if (!originActor) return;
if (originActor.id != this.hitTargets.first().actor.id) return;
let damageFormula = '1d10[fire]';
let damageType = 'fire';
let damageRoll = await new Roll(damageFormula).evaluate({async: true});
damageRoll.toMessage({flavor: 'Burning Aura'});
await MidiQOL.applyTokenDamage(
    [
        {
            damage: damageRoll.total,
            type: damageType
        }
    ],
    damageRoll.total,
    new Set([this.token.document]),
    null,
    null
);