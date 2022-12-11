let workflow = args[0].workflow;
if (workflow.hitTargets.size === 0) return;
let profBonus = workflow.actor.system.attributes.prof;
await chris.applyDamage(workflow.token, profBonus, 'temphp');