function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
let template = canvas.scene.collections.templates.get(args[0].templateId);
if (!template) return;
attachToken = await showMenu('Attach to self?', [['Yes', true], ['No', false]]) || false;
if (attachToken) {
	let tokenObject = args[0].workflow.token;
	await template.update(
		{
			'x': tokenObject.center.x,
			'y': tokenObject.center.y
		}
	);
	await tokenAttacher.attachElementsToToken([template], tokenObject, false);
}
await template.setFlag('world', 'spell.darkness', true);