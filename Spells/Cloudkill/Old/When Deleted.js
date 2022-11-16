console.log('Processing Deleted');
let tokenList = template.flags.world.spell.cloudkill.tokenList;
if (tokenList.length === 0) return;
for (let i = 0; tokenList.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(tokenList[i]);
	if (!tokenDoc) continue;
	console.log(tokenDoc);
	tokenDoc.unsetFlag('world', 'spell.cloudkill.' + template.id);
	let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (!effect) continue;
	let templateid = effect.flags.world.spell.cloudkill.templateid;
	let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
	console.log(tokenInTemplates);
	let deleteEffect = true;
	for (let j = 0; tokenInTemplates.length > j; j++) {
		let templateDoc = canvas.scene.collections.templates.get(tokenInTemplates[j]);
		console.log(templateDoc);
		if (!templateDoc) continue;
		let isCloudKill = templateDoc.flags.world?.spell?.cloudkill;
		console.log(isCloudKill);
		if (!isCloudKill) continue;
		deleteEffect = false;
	}
	if (templateid === template.id && deleteEffect === true) effect.delete();
}