let attackD20 = args[0][0].attackD20;
let killedTarget = false;
let hitTargets = args[0][0].hitTargets;
if (hitTargets.length != 1) return;
let damageList = args[0][0].damageList;
let newHP = damageList[0].newHP;
let oldHP = damageList[0].oldHP;
console.log(newHP);
console.log(oldHP);
if (newHP === 0 && newHP < oldHP) {
    killedTarget = true;
}
console.log(killedTarget);
if (attackD20 === 20 || killedTarget) {
    let actor = args[0][0].actor;
    let gritFeature = actor.items.getName('Grit');
    console.log(gritFeature);
    if (!gritFeature) return;
    let gritUses = gritFeature.system.uses.value;
    let gritMax = gritFeature.system.uses.max;
    await gritFeature.update({
       'system.uses.value': Math.clamped(gritUses + 1, 0, gritMax)
    });
    await ChatMessage.create({content: 'Grit gained!'});
}