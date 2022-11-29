async function showMenu(title, options) {
    return await game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
let actor = args[0].actor;
let healingLightFeature = args[0].item;
let targets = args[0].targets;
if (targets.length != 1) return;
let healingLightFeatureUses = healingLightFeature.system.uses.value + 1;
let lightMenu = [];
let chrBonus = Math.max(1, actor.system.abilities.cha.mod + 1);
let diceLimit = Math.min(chrBonus, healingLightFeatureUses);
switch (diceLimit) {
    case 6:
        lightMenu.push(['6d6', 6]);
    case 5:
        lightMenu.push(['5d6', 5]);
    case 4:
        lightMenu.push(['4d6', 4]);
    case 3:
        lightMenu.push(['3d6', 3]);
    case 2:
        lightMenu.push(['2d6', 2]);
    case 1:
        lightMenu.push(['1d6', 1]);
}
lightMenu.push(['Cancel', 0]);
let diceNum = await showMenu('How many D6 dice do you want to use?', lightMenu) || 0;
await item.update({
   'system.uses.value': healingLightFeatureUses - diceNum
});
if (diceNum === 0) {return;}
let diceRoll = await new Roll(diceNum + 'd6[healing]').roll({async: true});
diceRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
	flavor: 'Healing Light'
});
await MidiQOL.applyTokenDamage(
	[
		{
			damage: diceRoll.total,
			type: 'healing'
		}
	],
	diceRoll.total,
	new Set(targets),
	null,
	null
);
await item.update({
   'system.uses.value': healingLightFeatureUses - diceNum
});