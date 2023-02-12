let feature = this.actor.items.getName('Vampiric Touch Attack');
if (!feature) return;
let spellLevel = this.castData.castLevel;
await feature.update(
	{
		'system.damage.parts': [
			[
				spellLevel + 'd6[necrotic]',
				'necrotic'
			]
		]
	}
);