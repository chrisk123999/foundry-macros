let chris = {
	'dialog': async function _dialog(title, options) {
		let buttons = options.map(([label,value]) => ({label,value}));
		let selected = await warpgate.buttonDialog(
			{
				buttons,
				title,
			},
			'column'
		);
		return selected;
	},
	'findEffect': function _findEffect(actor, name) {
		return actor.effects.find(eff => eff.label === name);
	}
};
let effect = chris.findEffect(this.actor, 'Spirit Shroud');
if (!effect) return;
let options = [
	['Radiant', 'radiant'],
	['Necrotic', 'necrotic'],
	['Cold', 'cold']
];
let selection = await chris.dialog('What damage type?', options);
if (!selection) selection = 'necrotic';
await effect.setFlag('world', 'spell.spiritShroud', selection);