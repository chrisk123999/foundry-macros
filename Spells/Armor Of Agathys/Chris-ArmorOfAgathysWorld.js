Hooks.on('midi-qol.preDamageRoll', async workflow => {
    if (workflow.hitTargets.size != 1) return;
    let targetToken = workflow.targets.first();
    if (!targetToken) return;
    let targetActor = targetToken.actor;
    if (!targetActor) return;
    let attackType = workflow.item.system.actionType;
    if (!(attackType === 'mwak' || attackType === 'msak')) return;
    let targetEffect = targetActor.effects.find(eff => eff.label === 'Armor of Agathys');
    if (!targetEffect) return;
    let damage = targetActor.flags.world?.spell?.aoa;
    if (!damage) return;
    let tempHP = targetActor.system.attributes.hp.temp;
    if (tempHP === 0) return;
    await MidiQOL.applyTokenDamage(
        [
            {
                damage: damage,
                type: 'cold'
            }
        ],
        damage,
        new Set([workflow.token]),
        null,
        null
    );
});