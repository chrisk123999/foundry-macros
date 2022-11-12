console.log('Processing When Moved');
let tokensInTemplate = game.modules.get('templatemacro').api.findContained(template);
let tokenList = template.flags.world.spell.cloudkill.tokenList;
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
for (let i = 0; tokenList.length > i; i++) {
	if (tokensInTemplate.includes(tokenList[i])) continue;
	let tokenDoc = canvas.scene.tokens.get(tokenList[i]);
	let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (!effect) continue;
	let templateid = effect.flags.world.spell.cloudkill.templateid;
	if (templateid === template.id) effect.delete();
}
for (let i = 0; tokensInTemplate.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(tokensInTemplate[i]);
	if (game.combat != null && game.combat != undefined) {
		let combatTurn = game.combat.round + '-' + game.combat.turn;
		tokenDoc.document.setFlag('world', `spell.cloudkill.${template.id}.turn`, combatTurn);
	}
	let cloudEffect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
	let addEffect = true;
	if (cloudEffect) {
		addEffect = false;
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
		await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
	}
	if (!tokenList.includes(tokenDoc.id)) {
		tokenList.push(tokenDoc.id);
	}
}
template.setFlag('world', 'spell.cloudkill', {tokenList});