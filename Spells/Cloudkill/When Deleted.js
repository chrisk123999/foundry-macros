let tokenList = template.flags.world.tokens;
if (tokenList.length === 0) return;
for (let i = 0; tokenList.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(tokenList[i]);
	tokenDoc.unsetFlag('world', 'spell.cloudkill.' + template.id);
	let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (effect) effect.delete()
}