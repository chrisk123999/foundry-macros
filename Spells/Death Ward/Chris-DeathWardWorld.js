Hooks.on('midi-qol.damageApplied', async (token, {item, workflow, ditem}) => {
    let effect = token.actor.effects.find(eff => eff.label === 'Death Ward');
    if (!effect) return;
    if (ditem.newHP != 0) return;
    ditem.newHP = 1;
    ditem.hpDamage = Math.abs(ditem.newHP - ditem.oldHP);
    await effect.delete();
});