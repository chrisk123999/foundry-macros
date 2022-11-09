let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.cloudkill.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.cloudkill.${template.id}.turn`, combatTurn);
}
let tokenList = template.flags.world.tokens || [];
if (!tokenList.includes(token.id)) {
	tokenList.push(token.id);
}
template.setFlag('world', 'tokens', tokenList);
let spellLevel = template.flags.world.spellLevel || 5;
let spelldc = template.flags.world.spelldc || 10;
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
	'origin': template.flags.dnd5e.origin,
	'duration': {seconds: 86400},
	'flags': {
		'effectmacro': {
			'onTurnStart': {
				'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateId = effect.getFlag('world', 'spell.cloudkill.id');\nif (!templateId) return;\ntoken.document.setFlag('world', `spell.cloudkill.${templateId}.turn`, combatTurn);"
			}
		}
	}
}
await token.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
let cloudEffect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
cloudEffect.setFlag('world', 'spell.cloudkill.id', template.id);
if (doDamage) MidiQOL.doOverTimeEffect(token.actor, cloudEffect, true);