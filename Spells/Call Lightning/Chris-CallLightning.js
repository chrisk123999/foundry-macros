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
let actor = args[0].actor;
let stormBolt = actor.items.getName('Storm Bolt');
if (!stormBolt) return;
let item = args[0].item;
let storming = await chris.dialog('Is it already storming?', [['Yes', true], ['No', false]]);
let spellLevel = args[0].castData.castLevel;
if (storming) spellLevel += 1;
await stormBolt.update(
    {
        'system.damage.parts': [
            [
                spellLevel + 'd10[lightning]',
                'lightning'
            ]
        ]
    }
);