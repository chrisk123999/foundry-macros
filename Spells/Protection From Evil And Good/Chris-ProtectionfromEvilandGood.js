Hooks.on('midi-qol.preAttackRoll', workflow => {
	if (workflow.targets.size != 1) return;
	if (workflow.disadvantage === true) return;
	let targetToken = workflow.targets.first();
	let targetActor = targetToken.actor;
	let targetEffect = targetActor.effects.find(eff => eff.label === 'Protection from Evil and Good');
	if (!targetEffect) return;
	let actorRace;
	let sourceActor = workflow.actor;
	if (sourceActor.type === 'npc') {
		actorRace = sourceActor.system.details.type.value;
	} else if (sourceActor.type === 'character') {
		actorRace = sourceActor.system.details.race;
	}
	if (!actorRace) return;
	let races = ['aberration', 'celestial', 'elemental', 'fey', 'fiend', 'undead'];
	if (races.includes(actorRace)) workflow.disadvantage = true;
	workflow.attackAdvAttribution['Protection From Evil And Good'] = true;
});