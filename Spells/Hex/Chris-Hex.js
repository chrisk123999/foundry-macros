let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
let targetToken = workflow.targets.first();
let targetActor = targetToken.actor;
let effect = chris.findEffect(targetActor, 'Hexed');
if (effect) await chris.removeEffect(effect);
let selection = await chris.dialog('What ability should have disadvantage?', [
    ['Strength', 'str'],
    ['Dexterity', 'dex'],
    ['Constitution', 'con'],
    ['Intelligence', 'int'],
    ['Wisdom', 'wis'],
    ['Charisma', 'cha']
]);
if (!selection) selection = 'str';
let castLevel = workflow.castData.castLevel;
let seconds;
switch (castLevel) {
    case 3:
    case 4:
        seconds = 28800;
        break;
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
        seconds = 86400;
        break;
    default:
        seconds = 3600;
}
let effectData = {
	'label': 'Hexed',
	'icon': 'icons/magic/perception/silhouette-stealth-shadow.webp',
	'origin': args[0].item.uuid,
	'duration': {
		'seconds': seconds
	},
	'changes': [
		{
			'key': 'flags.midi-qol.disadvantage.ability.check.' + selection,
			'mode': 5,
			'value': '1',
			'priority': 20
		}
	]
};
await chris.createEffect(targetActor, effectData);
let sourceActor = args[0].actor;
let sourceEffect = chris.findEffect(sourceActor, 'Hex');
if (!sourceEffect) return;
let changes = sourceEffect.changes;
changes[0].value = targetToken.id;
let updates = {
    changes,
    'duration': {
        'seconds': seconds
    }
};
await chris.updateEffect(sourceEffect, updates);
let conEffect = chris.findEffect(sourceActor, 'Concentrating');
if (conEffect) {
    let updates = {
        'duration': {
            'seconds': seconds
        }
    };
    await chris.updateEffect(conEffect, updates);
}