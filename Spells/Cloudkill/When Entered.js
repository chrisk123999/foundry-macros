function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(10);
await game.macros.getName('Chris-CloudkillEffect').execute([token.id]);
let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) touchedTokens.push(token.id);
await template.setFlag('world', 'spell.cloudkill', {touchedTokens});
let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.cloudkill.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.cloudkill.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}
if (doDamage) {
	let effect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (effect)	MidiQOL.doOverTimeEffect(token.actor, effect, true);
}