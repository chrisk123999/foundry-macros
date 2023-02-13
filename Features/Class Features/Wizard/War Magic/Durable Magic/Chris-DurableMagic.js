if(!this.item.system.components.concentration) return;
let effect = this.actor.effects.find(i => i.label === "Concentrating");
if (!effect) return;
let updates = {
	'changes': [
		{
			'key': 'system.attributes.ac.bonus',
			'mode': 2,
			'value': '+2',
			'priority': 20
		},
		{
			'key': 'system.bonuses.abilities.save',
			'mode': 2,
			'value': '+2',
			'priority': 20
		}
	]
};
await effect.update(updates);