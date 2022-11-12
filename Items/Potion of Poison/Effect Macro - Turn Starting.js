let poisonedEffect = token.actor.effects.find(eff => eff.label === 'Poisoned');
if (!poisonedEffect) {
	effect.delete();
	return;
}
let stacks = await effect.getFlag('world', 'poisonStacks');
if (!stacks) stacks = 3;
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
let targets = [token];
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