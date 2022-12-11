let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
let targetToken = workflow.targets.first();
let targetActor = targetToken.actor;
let damageFormula = workflow.damageRoll._formula;
let skipHealing = false;
if (chris.findEffect(targetActor, 'Healer Healing Healed')) {
    damageFormula = "0";
    skipHealing = true;
}
if (targetActor.type === 'character' && !skipHealing) {
    let levels = 0;
    for (let i of Object.values(targetActor.classes)) {
        console.log(i);
        levels += i.system.levels;
    }
    damageFormula = damageFormula + ' + ' + levels;
}
workflow.damageRoll = await new Roll(damageFormula).roll({async: true});
workflow.damageTotal = workflow.damageRoll.total;
workflow.damageRollHTML = await workflow.damageRoll.render();