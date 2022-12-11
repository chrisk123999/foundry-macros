function chris = {
    'applyDamage': async function _applyDamage(tokenList, damageValue, damageType) {
        let targets;
        if (Array.isArray(tokenList)) {
            targets = new Set(tokenList);
        } else {
            targets = new Set([tokenList]);
        }
        await MidiQOL.applyTokenDamage(
            [
                {
                    damage: damageValue,
                    type: damageType
                }
            ],
            damageValue,
            targets,
            null,
            null
        );
    }
};
let workflow = args[0].workflow;
if (workflow.hitTargets.size === 0) return;
let profBonus = workflow.actor.system.attributes.prof;
await chris.applyDamage(workflow.token, profBonus, 'temphp');