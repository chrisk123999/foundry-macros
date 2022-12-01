let actor = args[0].actor;
let feature = actor.items.getName('Vampiric Touch Attack');
if (!feature) return;
let spellLevel = args[0].castData.castLevel;
await feature.update(
    {
        'system.damage.parts': [
            [
                spellLevel + 'd6[necrotic]',
                'necrotic'
            ]
        ]
    }
);