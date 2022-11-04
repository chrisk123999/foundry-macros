function updateEffect(tokenId, effectName, key, value) {
    return game.macros.getName('Chris-UpdateEffect').execute(tokenId, effectName, key, value);
}
function deleteEffect(tokenId, effectName) {
    return game.macros.getName('Chris-DeleteEffect').execute(tokenId, effectName);
}
Hooks.on('midi-qol.AttackRollComplete', async workflow => {
    if (workflow.targets.size != 1) return;
    if (workflow.isFumble === true) return;
    let targetToken = workflow.targets.first();
    if (!targetToken) return;
    let targetActor = targetToken.actor;
    if (!targetActor) return;
    let targetEffect = targetActor.effects.find(eff => eff.label === 'Mirror Image');
    if (!targetEffect) return;
    let duplicates = getProperty(targetActor, "flags.world.spell.mirrorimage");
    if (!duplicates) return;
    let roll = await new Roll('1d20').roll({async: true});
    roll.toMessage({
        rollMode: 'roll',
        speaker: {alias: name},
        flavor: 'Mirror Image'
    });
    let rollTotal = roll.total;
    let rollNeeded;
    switch (duplicates) {
        case 3:
            rollNeeded = 6;
            break;
        case 2:
            rollNeeded = 8;
            break;
        case 1:
            rollNeeded = 11;
            break;
    }
    if (rollTotal < rollNeeded) return;
    workflow.isFumble = true;
    let duplicateAC = 10 + targetActor.system.abilities.dex.mod;
    if (workflow.attackTotal >= duplicateAC) {
        await updateEffect(targetToken.id, 'Mirror Image', 1, duplicates - 1);
        ChatMessage.create({
            speaker: {alias: name},
            content: 'Attack hit a duplicate and destroyed it.'
        });
        if (duplicates === 1) {
            await deleteEffect(targetToken.id, 'Mirror Image');
        }
    } else {
        ChatMessage.create({
            speaker: {alias: name},
            content: 'Attack targeted a duplicate and missed.'
        });
    }
});