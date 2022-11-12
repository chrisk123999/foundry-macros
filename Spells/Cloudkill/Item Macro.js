console.log('Item Macro');
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
};
let tokenList = [];
for (let i = 0; args[0].targets.length > i; i++) {
	let otherToken = args[0].targets[i];
	tokenList.push(otherToken.id);
	let otherActor = otherToken.actor;
	let cloudEffect = otherActor.effects.find(eff => eff.label === 'Cloudkill');
	let addEffect = true;
	if (cloudEffect) {
		addEffect = false;
		let otherSpellLevel = cloudEffect.flags.world.spell.cloudkill.spellLevel;
		let otherSpelldc = cloudEffect.flags.world.spell.cloudkill.spelldc;
		if (otherSpellLevel < spellLevel) {
			addEffect = true;
			await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: otherActor.uuid, effects: [cloudEffect.id]});
		} else if (otherSpellLevel === spellLevel && otherSpelldc < spelldc) {
			addEffect = true;
			await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: otherActor.uuid, effects: [cloudEffect.id]});
		}
	}
	if (addEffect) {
		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: otherActor.uuid, effects: [effectData]});
	}
	
}
template.setFlag('world', 'spell.cloudkill', {spellLevel, spelldc, tokenList});
console.log(template);