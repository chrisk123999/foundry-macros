let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
let targetToken = workflow.targets.first();
let nearbyTokens = chris.findNearby(targetToken, 30, 'ally');
await chris.applyDamage(nearbyTokens, workflow.damageRoll.total, 'psychic');