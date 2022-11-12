if (game.combat != undefined) {
	if (game.combat != null) {
		return;
	}
}
if (args[0].targets.length === 0) return;
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
let targetToken = args[0].targets[0];
let targetActor = targetToken.actor;
let effect = targetActor.effects.find(eff => eff.label === 'Potion of Poison');
if (!effect) return;
let stacks = 3;
while (stacks > 0) {
	if (actor.system.attributes.hp.value <= 0) break;
	let save = await actor.rollAbilitySave('con');
	if (save.total >= 13) stacks -= 1;
	if (stacks === 0) {
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetActor.uuid, effects: [effect.id]});
		break;
	}
	let damageList = {
		3: '3d6[poison]',
		2: '2d6[poison]',
		1: '1d6[poison]'
	};
	let damageDice = damageList[stacks];
	damageRoll = await new Roll(damageDice).evaluate({async: true})
	damageRoll.toMessage({
		rollMode: 'roll',
		speaker: {alias: name},
		flavor: 'Potion of Poison'
	});
	damage = damageRoll.total;
	let damageType = 'poison';
	let targets = [targetToken];
	await MidiQOL.applyTokenDamage(
		[
			{
				damage: damage,
				type: damageType
			}
		],
		damage,
		new Set(targets),
		null,
		null
	);
	await sleep(500);
}