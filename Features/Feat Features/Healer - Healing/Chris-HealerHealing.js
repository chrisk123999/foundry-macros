let chris = {
    'findEffect': function _findEffect(actor, name) {
        return actor.effects.find(eff => eff.label === name);
    }
};
if (this.targets.size != 1) return;
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let damageFormula = this.damageRoll._formula;
let skipHealing = false;
if (chris.findEffect(targetActor, 'Healer Healing Healed')) {
    damageFormula = "0";
    skipHealing = true;
}
if (targetActor.type === 'character' && !skipHealing) {
    let levels = 0;
    for (let i of Object.values(targetActor.classes)) {
        levels += i.system.levels;
    }
    damageFormula = damageFormula + ' + ' + levels;
}
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);