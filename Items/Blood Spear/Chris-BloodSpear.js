if (args[0].hitTargets.length != 1) return;
let newHP = args[0].damageList[0].newHP;
let oldHP = args[0].damageList[0].oldHP;
if (newHP === 0 && oldHP != 0) {
    let damageRoll = await new Roll('2d6[temphp]').roll({async: true});
    damageRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Dragon’s Wrath Blood Revenant Double-Bladed Scimitar'
});
    await MidiQOL.applyTokenDamage(
    [
        {
            damage: damageRoll.total,
            type: 'temphp'
        }
    ],
    damageRoll.total,
    new Set([args[0].workflow.token.document]),
    args[0].item,
    null
);
}