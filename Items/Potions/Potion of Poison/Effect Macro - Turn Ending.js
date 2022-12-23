let poisonedEffect = token.actor.effects.find(eff => eff.label === 'Poisoned');
if (!poisonedEffect) {
	effect.delete();
	return;
}
let stacks = await effect.getFlag('world', 'poisonStacks');
if (!stacks) stacks = 3;
let save = await token.actor.rollAbilitySave('con');
if (save.total >= 13) {
	stacks -= 1;
	if (stacks === 0) {
		effect.delete()
		return;
	}
	await effect.setFlag('world', 'poisonStacks', stacks);
}