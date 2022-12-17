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
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    },
    'applyDamage': async function _applyDamage(tokenList, damageValue, damageType) {
        let targets;
        if (Array.isArray(tokenList)) {
            targets = new Set(tokenList);
        } else {
            targets = new Set([tokenList]);
        }
        await MidiQOL.applyTokenDamage(
            [
                {
                    damage: damageValue,
                    type: damageType
                }
            ],
            damageValue,
            targets,
            null,
            null
        );
    }
};
let workflow = args[0].workflow;
if (workflow.hitTargets.size != 1) return;
let selection = await chris.dialog('Fanged Bite', [['Restore HP', 'hp'], ['Skill Bonus', 'skill']]);
if (!selection) selection = 'hp';
let damageDealt = workflow.damageList[0].totalDamage;
switch (selection) {
    case 'hp':
        chris.applyDamage(workflow.token, damageDealt, 'healing');
        break;
    case 'skill':
        let effectData = {
			'label': 'Fanged Bite',
			'icon': 'icons/creatures/abilities/fang-tooth-blood-red.webp',
			'duration': {
				'seconds': 86400
			},
			'changes': [
				{
					'key': 'system.bonuses.abilities.check',
					'mode': 2,
					'value': damageDealt,
					'priority': 20
				},
				{
					'key': 'system.bonuses.All-Attacks',
					'mode': 2,
					'value': damageDealt,
					'priority': 20
				}
			],
			'flags': {
				'dae': {
					'specialDuration': [
						'1Attack',
						'isSkill'
					]
				}
			}
		};
		await chris.createEffect(workflow.actor, effectData);
        break;
}