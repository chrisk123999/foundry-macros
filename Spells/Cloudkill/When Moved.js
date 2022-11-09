let tokensInTemplate = game.modules.get('templatemacro').api.findContained(template);
let tokenList = template.flags.world.tokens;
for (let i = 0; tokenList.length > i; i++) {
	if (tokensInTemplate.includes(tokenList[i])) continue;
	let tokenDoc = canvas.scene.tokens.get(tokenList[i]);
	let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (effect) effect.delete()
}