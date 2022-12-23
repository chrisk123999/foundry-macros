let hpValue = actor.system.attributes.hp.value;
let hpMax = actor.system.attributes.hp.max;
let hpTemp = hpValue - hpMax;
if (hpValue <= hpMax) return;
let updates = {
	'system.attributes.hp.value': hpMax
};
await actor.update(updates);
await chris.applyDamage(token, hpTemp, 'temphp');