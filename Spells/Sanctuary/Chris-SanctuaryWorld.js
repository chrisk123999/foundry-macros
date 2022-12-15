Hooks.on('midi-qol.AttackRollComplete', async workflow => {
    if (workflow.targets.size != 1) return;
    let targetToken = workflow.targets.first();
    let targetEffect = targetToken.actor.effects.find(eff => eff.label === 'Sanctuary');
    if (!targetEffect) return;
    let targetActor = targetToken.actor;
    let targetItem = await fromUuid(targetEffect.origin);
    let scaling = targetItem.system.save.scaling;
    let spellDC;
    if (scaling === 'spell') {
        spellDC = targetItem.parent.system.attributes.spelldc;
    } else {
        spellDC = targetItem.parent.system.abilities[scaling].dc;
    }
    let sourceActor = workflow.actor;
    let save = await sourceActor.rollAbilitySave('wis');
    if (save.total >= spellDC) return;
    workflow.isFumble = true;
    ChatMessage.create({
        speaker: {alias: name},
        content: 'Target is protected by Sanctuary.'
    });
});