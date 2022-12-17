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
let damageDice = '2d8[radiant]';
let generatedMenu = [];
let mutationStack = warpgate.mutationStack(token.document);
actor.items.forEach(item => {
    if (item.type === 'weapon' && item.system.equipped === true) {
        let mutateItem = mutationStack.getName('Holy Weapon: ' + item.name);
        if (!mutateItem) generatedMenu.push([item.name, item.id]);
    }
});
let selection;
if (generatedMenu.length === 0) return;
if (generatedMenu.length === 1) selection = generatedMenu[0][1];
if (!selection) selection = await chris.dialog('What weapon?', generatedMenu);
if (!selection) return;
let weaponData = actor.items.get(selection).toObject();
weaponData.system.damage.parts.push([damageDice, 'radiant']);
let spellDC;
if (origin.system.ability === '') {
	spellDC = origin.parent.system.attributes.spelldc;
} else {
	spellDC = origin.parent.system.abilities[origin.system.ability].dc;
}
let packName = 'world.automated-spells';
let pack = game.packs.get(packName);
let packItems = await pack.getDocuments();
if (packItems.length === 0) return;
let featureData = packItems.find(item => item.name === 'Holy Weapon - Burst').toObject();
if (!featureData) return;
featureData.effects[0].changes[0].value = 'label=Holy Weapon - Burst (End of Turn),turn=end,saveDC=' + spellDC + ',saveAbility=con,savingThrow=true,saveMagic=true,saveRemove=true';
featureData.system.save.dc = spellDC;
let updates = {
    'embedded': {
        'Item': {
            [weaponData.name]: weaponData,
			'Holy Weapon - Burst': featureData
        }
    }
};
let options = {
    'permanent': false,
    'name': 'Holy Weapon: ' + weaponData.name,
    'description': 'Holy Weapon: ' + weaponData.name
};
await warpgate.mutate(token.document, updates, {}, options);
let macro = "warpgate.revert(token.document, '" + 'Holy Weapon: ' + weaponData.name + "');"
await effect.createMacro('onDelete', macro);