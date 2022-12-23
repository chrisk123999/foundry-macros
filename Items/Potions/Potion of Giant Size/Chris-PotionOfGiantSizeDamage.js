if (this.hitTargets.size != 1) return;
if (this.item.type != 'weapon') return;
let bonusDamageNumber = this.damageRoll.terms[0].number * 3 - this.damageRoll.terms[0].number;
let bonusDamageDice = this.damageRoll.terms[0].faces;
let flavor = this.damageRoll.terms[0].options.flavor;
let bonusDamageFormula = ' + ' + bonusDamageNumber + 'd' + bonusDamageDice + '[' + flavor + ']';
let damageFormula = this.damageRoll._formula + bonusDamageFormula;
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);