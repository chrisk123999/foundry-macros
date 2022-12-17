let chris = {
    'dialog': async function _dialog(title, options) {
        let buttons = options.map(([label,value]) => ({label,value}));
        let selected = await warpgate.buttonDialog(
            {
                buttons,
                title,
            },
            'column'
        );
        return selected;
    }
};
let template = canvas.scene.collections.templates.get(args[0].templateId);
if (!template) return;
attachToken = await chris.dialog('Attach to self?', [['Yes', true], ['No', false]]) || false;
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