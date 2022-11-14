function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
if (args[0].item.type === 'weapon' && args[0].hitTargets.length === 1) {
	let actor = args[0].actor;
	let effect = actor.effects.find(eff => eff.label === 'Blade Flourish Movement');
	if (effect) return;
    let bardicInspiration = actor.items.getName('Bardic Inspiration');
    let bardicInspirationUses = bardicInspiration.system.uses.value;
    if (bardicInspirationUses > 0) {
        let selectedOption = await showMenu('Use a Blade Flourish?', [
            ['Defensive Flourish', 'DF'],
            ['Mobile Flourish', 'MF'],
            ['Slashing Flourish', 'SF'],
            ['None', 'none']
        ]) || 'none';
        if (selectedOption != 'none') {
			let feature1 = actor.items.getName('Blade Flourish Movement');
			if (feature1) feature1.roll();
            bardicInspiration.update({'system.uses.value': bardicInspirationUses - 1});
            bardicInspirationDie = actor.system.scale.bard['bardic-inspiration'];
            if (args[0].isCritical === true) {
                bardicInspirationDie = 2 + bardicInspirationDie.substring(1);
            }
            const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
            let damageType = args[0].item.system.damage.parts[0][1];
            let damageFormula = workflow.damageRoll.formula + ' + ' + bardicInspirationDie + '[' + damageType + ']';
            workflow.damageRoll = await new Roll(damageFormula).roll({async: true});
            workflow.damageTotal = workflow.damageRoll.total;
            workflow.damageRollHTML = await workflow.damageRoll.render();
            bardicInspirationDieRoll = workflow.damageRoll.dice[workflow.damageRoll.dice.length - 1].total;
            switch (selectedOption) {
                case 'DF':
					let feature2 = actor.items.getName('Defensive Flourish');
					if (feature2) feature2.roll();
					let effectData = {
						'label': 'Defensive Flourish',
						'icon': 'icons/skills/melee/swords-parry-block-blue.webp',
						'duration': {'rounds': 1},
						'changes': [
							{
								'key': 'system.attributes.ac.bonus',
								'mode': 2,
								'value': '+' + bardicInspirationDieRoll,
								'priority': 20
							}
						],
						'origin': args[0].itemUuid,
					};
                    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                    break;
                case 'MF':
					let feature3 = actor.items.getName('Mobile Flourish');
					if (feature3) feature3.roll();
                    break;
                case 'SF':
					let feature4 = await actor.items.getName('Slashing Flourish');
					if (feature4) feature4.roll();
                    let selfToken = canvas.tokens.get(args[0].tokenId);
                    if (!selfToken) break;
                    let nearbyTargets = MidiQOL.findNearby(-1, selfToken, 5, null);
                    let hitTokenId = args[0].hitTargets[0].id;
                    let removeIndex = nearbyTargets.findIndex(tok => tok.id === hitTokenId);
                    if (removeIndex != -1) nearbyTargets.splice(removeIndex, 1);
                    await MidiQOL.applyTokenDamage(
                        [
                            {
                                damage: bardicInspirationDieRoll,
                                type: damageType
                            }
                        ],
                        bardicInspirationDieRoll,
                        new Set(nearbyTargets),
                        null,
                        null
                    );
                    break;
            }
        }
    }
}