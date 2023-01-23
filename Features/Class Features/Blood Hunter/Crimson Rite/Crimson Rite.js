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
let targetActor = this.actor;
let tokenDoc = this.token.document;
if (!tokenDoc) return;
let damageDice = targetActor.system.scale['blood-hunter']['crimson-rite'];
let generatedMenu = [];
let mutationStack = warpgate.mutationStack(tokenDoc);
targetActor.items.forEach(item => {
    if (item.type === 'weapon' && item.system.equipped === true) {
        let mutateItem = mutationStack.getName('Crimson Rite: ' + item.id);
        if (!mutateItem) generatedMenu.push([item.name, item.id]);
    }
});
let selection;
if (generatedMenu.length === 0) return;
if (generatedMenu.length === 1) selection = generatedMenu[0][1];
if (!selection) selection = await chris.dialog('What weapon?', generatedMenu);
if (!selection) return;
let riteMenu = [];
if (targetActor.items.getName('Crimson Rite: Rite of the Flame')) riteMenu.push(['Rite of the Flame', 'fire']);
if (targetActor.items.getName('Crimson Rite: Rite of the Frozen')) riteMenu.push(['Rite of the Frozen', 'cold']);
if (targetActor.items.getName('Crimson Rite: Rite of the Storm')) riteMenu.push(['Rite of the Storm', 'lightning']);
if (targetActor.items.getName('Crimson Rite: Rite of the Dead')) riteMenu.push(['Rite of the Dead', 'necrotic']);
if (targetActor.items.getName('Crimson Rite: Rite of the Oracle')) riteMenu.push(['Rite of the Oracle', 'psychic']);
if (targetActor.items.getName('Crimson Rite: Rite of the Roar')) riteMenu.push(['Rite of the Roar', 'thunder']);
let damageType;
if (riteMenu.length === 0) return;
if (riteMenu.length === 1) damageType = riteMenu[0][1];
if (!damageType) damageType = await chris.dialog('What Crimson Rite?', riteMenu);
if (!damageType) return;
let weaponData = targetActor.items.get(selection).toObject();
weaponData.system.damage.parts.push([damageDice + '[' + damageType + ']', damageType]);
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
				'script': "warpgate.revert(token.document, '" + 'Crimson Rite: ' + weaponData._id + "');"
			}
		},
	}
};
let updates = {
    'embedded': {
        'Item': {
            [weaponData.name]: weaponData
        },
        'ActiveEffect': {
            ['Crimson Rite: ' + weaponData.name]: effectData
        }
    }
};
let options = {
    'permanent': false,
    'name': 'Crimson Rite: ' + weaponData._id,
    'description': 'Crimson Rite: ' + weaponData.name
};
await warpgate.mutate(tokenDoc, updates, {}, options);