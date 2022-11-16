console.log('Processing When Staying');
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(20);
let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.cloudkill.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.cloudkill.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}
let spellLevel = template.flags.world.spell.cloudkill.spellLevel;
let spelldc = template.flags.world.spell.cloudkill.spelldc;
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
				"script": "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.cloudkill.templateid;\ntoken.document.setFlag('world', `spell.cloudkill.${templateid}.turn`, combatTurn);"
			}
		},
		'world': {
			'spell': {
				'cloudkill': {
					'templateid': template.id,
					'spellLevel': spellLevel,
					'spelldc': spelldc
				}
			}
		}
	}
}
let tokenList = template.flags.world.spell.cloudkill.tokenList;
if (!tokenList.includes(token.id)) {
	tokenList.push(token.id);
}
template.setFlag('world', 'spell.cloudkill', {tokenList});
let cloudEffect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
let addEffect = true;
if (cloudEffect) {
	console.log('Token has effect already.');
	addEffect = false;
	doDamage = false;
	let otherSpellLevel = cloudEffect.flags.world.spell.cloudkill.spellLevel;
	let otherSpelldc = cloudEffect.flags.world.spell.cloudkill.spelldc;
	if (otherSpellLevel < spellLevel) {
		addEffect = true;
		cloudEffect.delete();
	} else if (otherSpellLevel === spellLevel && otherSpelldc < spelldc) {
		addEffect = true;
		cloudEffect.delete();
	}
}
if (addEffect) {
	await token.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
	cloudEffect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
}
if (doDamage) MidiQOL.doOverTimeEffect(token.actor, cloudEffect, true);