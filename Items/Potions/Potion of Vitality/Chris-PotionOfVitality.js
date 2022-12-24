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
if (this.targets.size != 1) return;
let targetActor = this.targets.first().actor;
await chris.removeCondition(targetActor, 'Poisoned');