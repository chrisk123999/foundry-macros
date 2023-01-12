let chris = {
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    }
};
let targetToken = this.token;
let spellLevel = this.castData.castLevel;
let packName = 'world.automated-spells';
let pack = game.packs.get(packName);
if (!pack) return;
let packItems = await pack.getDocuments();
if (packItems.length === 0) return;
let itemData = packItems.find(item => item.name === 'Shadow Blade Sword');
if (!itemData) return;
let itemObject = itemData.toObject();
let diceNum = 2;
switch (spellLevel) {
    case 3:
    case 4:
        diceNum = 3;
        break;
    case 5:
    case 6:
        diceNum = 4;
        break;
    case 7:
    case 8:
    case 9:
        diceNum = 5;
        break;
}
itemObject.system.damage.parts = [
    [
        diceNum + 'd8[psychic ] + @mod',
        'psychic'
    ]
];
let updates = {
    'embedded': {
        'Item': {
            [itemObject.name]: itemObject
        }
    }
};
let options = {
    'permanent': false,
    'name': itemObject.name,
    'description': itemObject.name
};
await warpgate.mutate(targetToken.document, updates, {}, options);
let effectData = {
	'label': itemObject.name,
	'icon': itemObject.img,
	'duration': {
		'seconds': 60
	},
	'origin': this.item.uuid,
	'flags': {
		'effectmacro': {
			'onDelete': {
				'script': "warpgate.revert(token.document, '" + itemObject.name + "');"
			}
		},
	}
};
await chris.createEffect(targetToken.actor, effectData);