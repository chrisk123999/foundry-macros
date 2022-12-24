let effect = chris.findEffect(this.actor, 'Detect Thoughts');
if (!effect) return;
await chris.removeEffect(effect);
await chris.removeCondition(this.actor, 'Concentrating');