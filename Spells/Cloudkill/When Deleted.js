let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.cloudkill.' + template.id);
}
if (touchedTokens) game.macros.getName('Chris-CloudkillEffect').execute(touchedTokens);