let auraName = 'Fire Form - Aura';
let featureName = 'Fire Form';
if (this.hitTargets.size === 0) return;
let effect = this.actor.effects.find(eff => eff.label === auraName);
if (!effect) return;
if (!(this.item.system.actionType === 'mwak' || this.item.system.actionType === 'msak')) return;
let distance = MidiQOL.getDistance(this.token, this.targets.first(), {wallsBlock: false});
if (distance > 5) return;
let originItem = await fromUuid(effect.origin);
if (!originItem) return;
let originActor = originItem.actor;
if (!originActor) return;
let originFeature = originActor.items.getName(featureName);
if (!originFeature) return;
if (!(this.item.system.actionType === 'mwak' || this.item.system.actionType === 'msak')) return;
let options = {
	'showFullCard': false,
	'createWorkflow': true,
	'targetUuids': [this.token.document.uuid],
	'configureDialog': false,
	'versatile': false,
	'consumeResource': false,
	'consumeSlot': false,
};
await MidiQOL.completeItemUse(originFeature, {}, options);