if (this.targets.size === 0) return;
if (this.item.type != 'spell') return;
if (this.item.system.level === 0) return;
let damageType = this.defaultDamageType;
let validTypes = ['lightning', 'thunder'];
if (!validTypes.includes(damageType)) return;
let feature = this.actor.items.getName('Heart of the Storm');
if (feature) await feature.use();