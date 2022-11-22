let devilsSight = 'Devil\'s Sight';
Hooks.on('midi-qol.preAttackRoll', async workflow => {
    if (workflow.targets.size != 1) return;
	let targetToken = workflow.targets.first().document;
    if (!targetToken) return;
	let sourceToken = workflow.token.document;
	let sourceTemplates = game.modules.get('templatemacro').api.findContainers(sourceToken);
	let sourceInDarkness = false;
	for (let i = 0; sourceTemplates.length > i; i++) {
		let testTemplate = canvas.scene.collections.templates.get(sourceTemplates[i]);
		if (!testTemplate) continue;
		let darkness = testTemplate.flags.world?.spell?.darkness;
		if (darkness) {
			sourceInDarkness = true;
			break;
		}
	}
	let targetInDarkness = false;
	let targetTemplates = game.modules.get('templatemacro').api.findContainers(targetToken);
	for (let i = 0; targetTemplates.length > i; i++) {
		let testTemplate = canvas.scene.collections.templates.get(targetTemplates[i]);
		if (!testTemplate) continue;
		let darkness = testTemplate.flags.world?.spell?.darkness;
		if (darkness) {
			targetInDarkness = true;
			break;
		}
	}
	if (!sourceInDarkness && !targetInDarkness) return;
	let distance = MidiQOL.getDistance(sourceToken, targetToken, {wallsBlock: false});
	let sourceCanSeeTarget = false;
	let targetCanSeeSource = false;
	let sourceActor = sourceToken.actor;
	let targetActor = targetToken.actor;
	let sourceDS = sourceActor.items.getName(devilsSight);
	let targetDS = targetActor.items.getName(devilsSight);
	let sourceSenses = sourceToken.actor.system.attributes.senses;
	let targetSenses = targetToken.actor.system.attributes.senses;
	if ((sourceDS && distance <= 120) || (sourceSenses.tremorsense >= distance) || (sourceSenses.blindsight >= distance) || (sourceSenses.truesight >= distance)) sourceCanSeeTarget = true;
	if ((targetDS && distance <= 120) || (targetSenses.tremorsense >= distance) || (targetSenses.blindsight >= distance) || (targetSenses.truesight >= distance)) targetCanSeeSource = true;
	if (sourceCanSeeTarget && targetCanSeeSource) return;
	if (sourceCanSeeTarget && !targetCanSeeSource) workflow.advantage = true;
	if (!sourceCanSeeTarget && targetCanSeeSource) {
		workflow.disadvantage = true;
		workflow.flankingAdvantage = false;
	}
	if (!sourceCanSeeTarget && !targetCanSeeSource) {
		workflow.advantage = false;
		workflow.disadvantage = false;
		workflow.rollOptions.advantage = false;
		workflow.rollOptions.disadvantage = false;
		workflow.flankingAdvantage = false;
	}
});