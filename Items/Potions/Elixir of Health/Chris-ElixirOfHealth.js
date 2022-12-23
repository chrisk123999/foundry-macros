let chris = {
    'removeCondition': async function _removeCondition(actor, name) {
        await game.dfreds.effectInterface.removeEffect(
            {
                'effectName': name,
                'uuid': actor.uuid
            }
        );
    }
};
let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
let targetActor = workflow.targets.first().actor;
await chris.removeCondition(targetActor, 'Blinded');
await chris.removeCondition(targetActor, 'Deafened');
await chris.removeCondition(targetActor, 'Paralyzed');
await chris.removeCondition(targetActor, 'Poisoned');