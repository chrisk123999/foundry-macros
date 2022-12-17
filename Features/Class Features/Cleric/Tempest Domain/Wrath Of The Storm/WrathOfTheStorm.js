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
let selection = await chris.dialog('What damage type?', [['Lightning', 'lightning'], ['Thunder', 'thunder']]);
if (!selection) selection = 'lightning';
let damageFormula = args[0].workflow.damageRoll._formula + selection;
args[0].workflow.damageRoll = await new Roll(damageFormula).roll({async: true});
args[0].workflow.damageTotal = args[0].workflow.damageRoll.total;
args[0].workflow.damageRollHTML = await args[0].workflow.damageRoll.render();