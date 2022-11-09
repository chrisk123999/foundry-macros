let template = canvas.scene.collections.templates.get(args[0].templateId);
if (!template) return;
let spellLevel = args[0].spellLevel;
let spelldc = args[0].actor.system.attributes.spelldc;
let damageRoll = spellLevel + 'd8';
let effectData = {
	'label': 'Cloudkill',
	'icon': 'icons/magic/air/fog-gas-smoke-swirling-green.webp',
	'changes': [
		{
		'key': 'flags.midi-qol.OverTime',
		'mode': 5,
		'value': 'turn=start, rollType=save, saveAbility= con, saveDamage= halfdamage, saveRemove= false, saveMagic=true, damageType= poison, damageRoll= ' + damageRoll + ', saveDC = ' + spelldc,
		'priority': 20
		}
	],
	'origin': args[0].itemUuid,
	'duration': {seconds: 86400},
	'flags': {
		'effectmacro': {
			'onTurnStart': {
				'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateId = effect.getFlag('world', 'spell.cloudkill.id');\nif (!templateId) return;\ntoken.document.setFlag('world', `spell.cloudkill.${templateId}.turn`, combatTurn);"
			}
		},
		'world': {
			'spell': {
				'cloudkill': {
					'id': args[0].templateId
				}
			}
		}
	}
};
let tokenList = [];
for (let i = 0; args[0].targets.length > i; i++) {
	if (!tokenList.includes(args[0].targets[i].id)) {
		tokenList.push(args[0].targets[i].id);
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: args[0].targets[i].actor.uuid, effects: [effectData]});
	}
}
template.setFlag('world', 'tokens', tokenList);
template.setFlag('world', 'spellLevel', spellLevel);
template.setFlag('world', 'spelldc', spelldc);