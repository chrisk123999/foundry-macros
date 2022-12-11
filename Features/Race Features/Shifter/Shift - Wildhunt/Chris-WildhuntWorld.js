Hooks.on('midi-qol.preAttackRoll', async workflow => {
    if (workflow.targets.size != 1) return;
    let sourceActor = workflow.actor;
    let effect = sourceActor.effects.find(eff => eff.label === 'Wildhunt Aura');
    if (!effect) return;
    let origin = await fromUuid(effect.origin);
    let originActorId = origin.actor.id;
    let targetToken = workflow.targets.first();
    let targetActor = targetToken.actor;
    if (targetActor.id != originActorId) return;
    workflow.advantage = false;
    workflow.rollOptions.advantage = false;
    workflow.flankingAdvantage = false;
});