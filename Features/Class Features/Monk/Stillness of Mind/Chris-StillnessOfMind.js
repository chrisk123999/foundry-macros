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
let selection = await chris.dialog('What condition would you like to remove?', [['Charmed', 'Charmed'], ['Frightened', 'Frightened']]);
if (!selection) return;
await game.dfreds.effectInterface.removeEffect({effectName: selection, uuid: args[0].actor.uuid});