if (this.targets.size === 0) return;
if (this.item.type != 'spell') return;
let damageType = this.defaultDamageType;
let validTypes = ['healing', 'acid', 'fire', 'necrotic', 'posion'];
if (!validTypes.includes(damageType)) return;
let damageFormula = this.damageRoll._formula + ' + ' + this.actor.system.abilities.int.mod;
this.damageRoll = await new Roll(damageFormula).roll({async: true});
this.damageTotal = this.damageRoll.total;
this.damageRollHTML = await this.damageRoll.render();