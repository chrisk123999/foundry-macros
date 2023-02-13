let sourceActorUuid = 'Change This';
let echoActorUuid = 'Change This';

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
	}
};
if (this.targets.size != 1) return;
let originalActor = await fromUuid(sourceActorUuid);
let generatedMenu = [];
originalActor.items.forEach(item => {
	if (item.type === 'weapon' && item.system.equipped === true) {
		generatedMenu.push([item.name, item.id]);
	}
});
let selection;
if (generatedMenu.length === 0) return;
if (generatedMenu.length === 1) selection = generatedMenu[0][1];
if (!selection) selection = await chris.dialog('What weapon do you want to use?', generatedMenu);
if (!selection) return;
let weaponData = duplicate(originalActor.items.get(selection).toObject());
let options = {
	'showFullCard': false,
	'createWorkflow': true,
	'targetUuids': [this.targets.first().document.uuid],
	'configureDialog': false,
	'versatile': false,
	'consumeResource': false,
	'consumeSlot': false,
};
let echoActor = await fromUuid(echoActorUuid);
let weapon = new CONFIG.Item.documentClass(weaponData, {parent: echoActor});
await MidiQOL.completeItemUse(weapon, {}, options);