let actor = args[0].actor;
let tokenDoc = args[0].workflow.token.document;
if (!tokenDoc) return;
let selected = await chris.dialog('What item?', [
    ['Ale', false],
    ['Olive Oil', false],
    ['Potion of Healing (Normal)', 'Potion of Healing (Normal)'],
    ['Potion of Climbing', 'Potion of Climbing'],
    ['Mead', false],
    ['Potion of Fire Breath', 'Potion of Fire Breath'],
    ['Potion of Healing (Greater)', 'Potion of Healing (Greater)']
]);
let packName;
switch (selected) {
    case 'Potion of Healing (Normal)':
    case 'Potion of Climbing':
    case 'Potion of Healing (Greater)':
        packName = 'world.ddb-homebrew-ddb-items';
        break;
    case 'Potion of Fire Breath':
        packName = 'world.automated-items';
        break;
    default:
        return;
}
let pack = game.packs.get(packName);
let packItems = await pack.getDocuments();
if (packItems.length === 0) return;
let itemData = packItems.find(item => item.name === selected);
if (!itemData) return;
itemData.name = 'Dragon Vessel: ' + itemData.name;
let updates = {
    'embedded': {
        'Item': {
            [itemData.name]: itemData
        }
    }
};
let options = {
    'permanent': false,
    'name': itemData.name,
    'description': itemData.name
};
await warpgate.mutate(tokenDoc, updates, {}, options);
let effectData = {
	'label': itemData.name,
	'icon': 'icons/containers/kitchenware/goblet-jeweled-red.webp',
	'duration': {
		'seconds': 604800
	},
	'flags': {
		'dae': {
	        'specialDuration': [
		        'longRest'
	        ],
	        'stackable': 'multi',
	        'macroRepeat': 'none'
        },
		'effectmacro': {
			'onDelete': {
				'script': "warpgate.revert(token.document, '" + itemData.name + "');"
			}
		},
	}
};
await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);