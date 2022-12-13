let targetTokenId = effect.changes[0].value;
let targetToken = canvas.scene.tokens.get(targetTokenId);
if (!targetToken) return;
let targetActor = targetToken.actor;
let targetEffect =  chris.findEffect(targetActor, 'Hexed');
if (!targetEffect) return;
await chris.removeEffect(targetEffect);