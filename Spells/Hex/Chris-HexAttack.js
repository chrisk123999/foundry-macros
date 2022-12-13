if (this.hitTargets.size != 1) return;
let sourceActor = this.actor;
let hexedTarget = sourceActor.flags.world?.spell?.hex;
let targetToken = this.hitTargets.first();
if (targetToken.id != hexedTarget) return;
let oldFormula = this.damageRoll._formula;
let damageFormula = oldFormula + ' + 1d6[necrotic]';
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);