function chris = {
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
let featureData = {
	'name': 'Holy Weapon - Burst',
	'type': 'feat',
	'img': 'icons/magic/light/projectile-smoke-yellow.webp',
	'system': {
		'description': {
			'value': '<p>As a bonus action on your turn, you can dismiss this spell and cause the weapon to emit a burst of radiance. Each creature of your choice that you can see within 30 feet of the weapon must make a Constitution saving throw. On a failed save, a creature takes 4d8 radiant damage, and it is blinded for 1 minute. On a successful save, a creature takes half as much damage and isn’t blinded. At the end of each of its turns, a blinded creature can make a Constitution saving throw, ending the effect on itself on a success.</p>'
		},
		'activation': {
			'type': 'bonus',
			'cost': 1,
			'condition': ''
		},
		'duration': {
			'value': 1,
			'units': 'minute'
		},
		'target': {
			'value': null,
			'width': null,
			'units': '',
			'type': 'creature'
		},
		'range': {
			'value': 30,
			'long': null,
			'units': 'ft'
		},
		'damage': {
			'parts': [
				[
					'4d8[radiant]',
					'radiant'
				]
			],
		'versatile': ''
		},
		'save': {
			'ability': 'con',
			'dc': spellDC,
			'scaling': 'flat'
		}
	},
	'effects': [
		{
			'label': 'Holy Weapon - Burst',
			'icon': 'icons/magic/light/projectile-smoke-yellow.webp',
			'changes': [
				{
					'key': 'flags.midi-qol.OverTime',
					'mode': 0,
					'value': 'label=Holy Weapon - Burst (End of Turn),turn=end,saveDC=' + spellDC + ',saveAbility=con,savingThrow=true,saveMagic=true,saveRemove=true',
					'priority': 20
				},
				{
					'key': 'macro.CE',
					'mode': 0,
					'value': 'Blinded',
					'priority': 20
				}
			],
			'transfer': false,
			'_id': 'XuRLr1RfsMGophvq',
			'disabled': false,
			'duration': {
				'startTime': null,
				'seconds': null,
				'combat': null,
				'rounds': null,
				'turns': null,
				'startRound': null,
				'startTurn': null
			},
			'origin': null,
			'tint': null,
			'flags': {
				'dae': {
					'selfTarget': false,
					'selfTargetAlways': false,
					'stackable': 'none',
					'durationExpression': '',
					'macroRepeat': 'none',
					'specialDuration': []
				}
			}
		}
	],
	'flags': {
		'midi-qol': {
			'effectActivation': false,
			'onUseMacroName': '[postActiveEffects]ItemMacro'
		},
		'midiProperties': {
			'nodam': false,
			'fulldam': false,
			'halfdam': true,
			'autoFailFriendly': false,
			'rollOther': false,
			'critOther': false,
			'offHandWeapon': false,
			'magicdam': true,
			'magiceffect': true,
			'concentration': false,
			'toggleEffect': false,
			'ignoreTotalCover': false
		},
		'itemacro': {
			'macro': {
				'name': 'Holy Weapon - Burst',
				'type': 'script',
				'scope': 'global',
				'command': "let effect = args[0].actor.effects.find(eff => eff.label === 'Holy Weapon');\nif (!effect) return;\neffect.delete();",
				'author': 'zqNQc5kF3CqkzwOD',
				'_id': null,
				'img': 'icons/svg/dice-target.svg',
				'folder': null,
				'sort': 0,
				'ownership': {
					'default': 0
				},
				'flags': {},
				'_stats': {
					'systemId': null,
					'systemVersion': null,
					'coreVersion': null,
					'createdTime': null,
					'modifiedTime': null,
					'lastModifiedBy': null
				}
			}
		},
		'favtab': {
			'isFavorite': true
		}
	}
};
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