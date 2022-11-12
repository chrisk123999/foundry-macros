console.log('Processing Deleted');
let tokenList = template.flags.world.spell.cloudkill.tokenList;
if (tokenList.length === 0) return;
for (let i = 0; tokenList.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(tokenList[i]);
	if (!tokenDoc) continue;
	console.log(tokenDoc);
	tokenDoc.unsetFlag('world', 'spell.cloudkill.' + template.id);
	let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (!effect) return;
	let templateid = effect.flags.world.spell.cloudkill.templateid;
	if (templateid === template.id) effect.delete();
}