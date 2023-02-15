let chris = {
	'dialog': async function _dialog(title, options) {
		let buttons = options.map(([label,value]) => ({label,value}));
		let selected = await warpgate.buttonDialog(
			{
				buttons,
				title,
			},
			'column'
		);
		return selected;
	},
	'findEffect': function _findEffect(actor, name) {
		return actor.effects.find(eff => eff.label === name);
	},
	'applyDamage': async function _applyDamage(tokenList, damageValue, damageType) {
		let targets;
		if (Array.isArray(tokenList)) {
			targets = new Set(tokenList);
		} else {
			targets = new Set([tokenList]);
		}
		await MidiQOL.applyTokenDamage(
			[
				{
					damage: damageValue,
					type: damageType
				}
			],
			damageValue,
			targets,
			null,
			null
		);
	},
	'findNearby': function _findNearby(tokenDoc, range, disposition) {
		let dispositionValue;
		switch (disposition) {
			case 'ally':
				dispositionValue = 1;
				break;
			case 'neutral':
				dispositionValue = 0;
				break;
			case 'enemy':
				dispositionValue = -1;
				break;
			default:
				dispositionValue = null;
		}
		return MidiQOL.findNearby(dispositionValue, tokenDoc, range);
	}
};
let sourceActor = this.actor;
let effect1 = chris.findEffect(sourceActor, 'BLade Flourish Movement');
if (this.item.type === 'weapon' && !effect1) {
	let feature0 = sourceActor.items.getName('Blade Flourish Movement');
	if (feature0) feature0.use();
}
if (this.item.type === 'weapon' && this.hitTargets.size === 1) {
	let effect2 = chris.findEffect(sourceActor, 'Blade Flourish');
	if (effect2) return;
	let bardicInspiration = sourceActor.items.getName('Bardic Inspiration');
	let bardicInspirationUses = bardicInspiration.system.uses.value;
	if (bardicInspirationUses <= 0) return;
	let selectedOption = await chris.dialog('Use a Blade Flourish?', [
		['Defensive Flourish', 'DF'],
		['Mobile Flourish', 'MF'],
		['Slashing Flourish', 'SF'],
		['None', 'none']
	]) || 'none';
	if (selectedOption != 'none') {
		let effectData1 = {
			'label': 'Blade Flourish',
			'icon': 'icons/skills/melee/maneuver-sword-katana-yellow.webp',
			'duration': {'turns': 1},
			'origin': this.item.uuid,
			'flags': {
				'dae': {
					'specialDuration': [
						'combatEnd'
					]
				}
			}
		};
		await sourceActor.createEmbeddedDocuments("ActiveEffect", [effectData1]);
		bardicInspiration.update({'system.uses.value': bardicInspirationUses - 1});
		bardicInspirationDie = sourceActor.system.scale.bard['bardic-inspiration'];
		if (this.isCritical) {
			bardicInspirationDie = 2 + bardicInspirationDie.substring(1);
		}
		let damageType = this.item.system.damage.parts[0][1];
		let damageFormula = this.damageRoll.formula + ' + ' + bardicInspirationDie + '[' + damageType + ']';
		let damageRoll = await new Roll(damageFormula).roll({async: true});
		await this.setDamageRoll(damageRoll);
		bardicInspirationDieRoll = this.damageRoll.dice[this.damageRoll.dice.length - 1].total;
		switch (selectedOption) {
			case 'DF':
				let feature2 = sourceActor.items.getName('Defensive Flourish');
				if (feature2) feature2.use();
				let effectData2 = {
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
					'origin': this.item.uuid,
					'flags': {
						'dae': {
							'specialDuration': [
								'combatEnd'
							]
						}
					}
				};
				await sourceActor.createEmbeddedDocuments("ActiveEffect", [effectData2]);
				break;
			case 'MF':
				let feature3 = sourceActor.items.getName('Mobile Flourish');
				if (feature3) feature3.use();
				break;
			case 'SF':
				let feature4 = await sourceActor.items.getName('Slashing Flourish');
				if (feature4) feature4.use();
				let nearbyTargets = chris.findNearby(this.token, 5, 'enemy');
				let hitTokenId = this.hitTargets.first().id;
				let removeIndex = nearbyTargets.findIndex(tok => tok.id === hitTokenId);
				if (removeIndex != -1) nearbyTargets.splice(removeIndex, 1);
				await chris.applyDamage([nearbyTargets], bardicInspirationDieRoll, damageType);
				break;
		}
	}
}