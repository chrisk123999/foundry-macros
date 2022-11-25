function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
let actor = args[0].actor;
let tokenDoc = args[0].workflow.token.document;
if (!tokenDoc) return;
let damageDice = actor.system.scale['blood-hunter']['crimson-rite'];
let generatedMenu = [];
let mutationStack = warpgate.mutationStack(tokenDoc);
actor.items.forEach(item => {
    if (item.type === 'weapon' && item.system.equipped === true) {
        let mutateItem = mutationStack.getName('Crimson Rite: ' + item.name);
        if (!mutateItem) generatedMenu.push([item.name, item.id]);
    }
});
let selection;
if (generatedMenu.length === 0) return;
if (generatedMenu.length === 1) selection = generatedMenu[0][1];
if (!selection) selection = await showMenu('What weapon?', generatedMenu);
if (!selection) return;
let riteMenu = [];
if (actor.items.getName('Crimson Rite: Rite of the Flame')) riteMenu.push(['Rite of the Flame', 'fire']);
if (actor.items.getName('Crimson Rite: Rite of the Frozen')) riteMenu.push(['Rite of the Frozen', 'cold']);
if (actor.items.getName('Crimson Rite: Rite of the Storm')) riteMenu.push(['Rite of the Storm', 'lightning']);
if (actor.items.getName('Crimson Rite: Rite of the Dead')) riteMenu.push(['Rite of the Dead', 'necrotic']);
if (actor.items.getName('Crimson Rite: Rite of the Oracle')) riteMenu.push(['Rite of the Oracle', 'psychic']);
if (actor.items.getName('Crimson Rite: Rite of the Roar')) riteMenu.push(['Rite of the Roar', 'thunder']);
let damageType;
if (riteMenu.length === 0) return;
if (riteMenu.length === 1) damageType = riteMenu[0][1];
if (!damageType) damageType = await showMenu('What Crimson Rite?', riteMenu);
if (!damageType) return;
let weaponData = actor.items.get(selection).toObject();
weaponData.system.damage.parts.push([damageDice + '[' + damageType + ']', damageType]);
let updates = {
    'embedded': {
        'Item': {
            [weaponData.name]: weaponData
        }
    }
};
let options = {
    'permanent': false,
    'name': 'Crimson Rite: ' + weaponData.name,
    'description': 'Crimson Rite: ' + weaponData.name
};
await warpgate.mutate(tokenDoc, updates, {}, options);
let effectData = {
	'label': 'Crimson Rite: ' + weaponData.name,
	'icon': 'icons/skills/melee/strike-sword-blood-red.webp',
	'duration': {
		'seconds': 604800
	},
	'flags': {
		'dae': {
	        'specialDuration': [
		        'zeroHP',
		        'longRest',
		        'shortRest'
	        ],
	        'stackable': 'multi',
	        'macroRepeat': 'none'
        },
		'effectmacro': {
			'onDelete': {
				'script': "warpgate.revert(token.document, '" + 'Crimson Rite: ' + weaponData.name + "');"
			}
		},
	}
};
await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);