let tokenDoc = this.token.document;
if (!tokenDoc) return;
let sourceActor = this.actor;
let roll = await new Roll('1d6').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Experimental Elixir'
});
let itemName;
switch (roll.total) {
    case 1:
        itemName = 'Experimental Elixir - Healing';
        break;
    case 2:
        itemName = 'Experimental Elixir - Swiftness';
        break;
    case 3:
        itemName = 'Experimental Elixir - Resilience';
        break;
    case 4:
        itemName = 'Experimental Elixir - Boldness';
        break;
    case 5:
        itemName = 'Experimental Elixir - Flight';
        break;
    case 6:
        itemName = 'Experimental Elixir - Transformation';
        break;
}
let item = sourceActor.items.getName(itemName);
if (item) {
    item.update({
        'system.quantity': item.system.quantity + 1
    });
} else {
    let pack = game.packs.get('world.automated-class-features');
    if (!pack) return;
    let packItems = await pack.getDocuments();
    if (packItems.length === 0) return;
    let itemData = packItems.find(item => item.name === itemName);
    if (!itemData) return;
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
	    'label': 'Experimental Elixir - ' + itemData.name,
	    'icon': 'icons/tools/laboratory/mortar-liquid-pink.webp',
	    'origin': this.item.uuid,
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
		    }
	    }
    };
    await chris.createEffect(sourceActor, effectData);
}