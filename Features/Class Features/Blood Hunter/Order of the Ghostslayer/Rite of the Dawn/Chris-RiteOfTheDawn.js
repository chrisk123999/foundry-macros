let hasFeature = this.item.flags.world?.feature?.rotd;
if (!hasFeature) return;
if (this.hitTargets.size != 1) return;
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let targetType = targetActor.system.details.type?.value;
if (targetType != 'undead') return;
let damageDice = this.actor.system.scale['blood-hunter']['crimson-rite'];
if (this.isCritical) damageDice = 2 + damageDice.substring(1);
let damageFormula = this.damageRoll._formula + ' + ' + damageDice + '[radiant]';
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);