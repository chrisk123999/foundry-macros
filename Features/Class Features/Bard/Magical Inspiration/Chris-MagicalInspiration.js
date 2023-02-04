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
	'removeEffect': async function _removeEffect(effect) {
		if (game.user.isGM) {
			await effect.delete();
		} else {
			await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': effect.parent.uuid, 'effects': [effect.id]});
		}
	},
	'addToRoll': async function _addToRoll(roll, addonFormula) {
		let addonFormulaRoll = await new Roll('0 + ' + addonFormula).evaluate({async: true});
		for (let i = 1; i < addonFormulaRoll.terms.length; i++) {
			roll.terms.push(addonFormulaRoll.terms[i]);
		}
		roll._total += addonFormulaRoll.total;
		roll._formula = roll._formula + ' + ' + addonFormula;
		return roll;
	},
	'selectTarget': async function _selectTarget(title, buttons, targets, returnUuid) {
		let generatedInputs = [];
		let isFirst = true;
		for (let i of targets) {
			let name = i.document.name;
			let texture = i.document.texture.src;
			let html = `<img src="` + texture + `" id="` + i.id + `" style="width:40px;height:40px;vertical-align:middle;"><span>` + name + `</span>`;
			let value = i.id;
			if (returnUuid) value = i.document.uuid;
			generatedInputs.push({
				'label': html,
				'type': 'radio',
				'options': ['group1', isFirst],
				'value': value
			});
			isFirst = false;
		}
		function dialogRender(html) {
			let trs = html[0].getElementsByTagName('tr');
			for (let t of trs) {
				t.style.display = 'flex';
				t.style.flexFlow = 'row-reverse';
				t.style.alignItems = 'center';
				t.style.justifyContent = 'flex-end';
				t.addEventListener('click', function () {t.getElementsByTagName('input')[0].checked = true});
			}
			let ths = html[0].getElementsByTagName('th');
			for (let t of ths) {
				t.style.width = 'auto';
				t.style.textAlign = 'left';
			}
			let tds = html[0].getElementsByTagName('td');
			for (let t of tds) {
				t.style.width = '50px';
				t.style.textAlign = 'center';
				t.style.paddingRight = '5px';
			}
			let imgs = html[0].getElementsByTagName('img');
			for (let i of imgs) {
				i.style.border = 'none';
				i.addEventListener('click', async function () {
					await canvas.ping(canvas.tokens.get(i.getAttribute('id')).document.object.center);
				});
				i.addEventListener('mouseover', function () {
					let targetToken = canvas.tokens.get(i.getAttribute('id'));
					targetToken.hover = true;
					targetToken.refresh();
				});
				i.addEventListener('mouseout', function () {
					let targetToken = canvas.tokens.get(i.getAttribute('id'));
					targetToken.hover = false;
					targetToken.refresh();
				});
			}
		}
		let config = {
			'title': title,
			'render': dialogRender
		};
		return await warpgate.menu(
			{
				'inputs': generatedInputs,
				'buttons': buttons
			},
			config
		);
	},
	'checkTrait': function _checkTrait(actor, type, trait) {
		return actor.system.traits[type].value.indexOf(trait) > -1;
	}
};
let workflow = args[0].workflow;
if (workflow.targets.size === 0) return;
let pass = args[0].macroPass;
let targets = workflow.targets;
let effect = chris.findEffect(workflow.actor, 'Inspired');
let bardDice;
if (effect) {
	let originItem = await fromUuid(effect.origin);
	let originActor = originItem.parent;
	bardDice = originActor.system.scale?.bard['bardic-inspiration'];
}
if (!bardDice) return;
switch (pass) {
	case 'preDamageApplication':
		if (!effect) return;
		if ((workflow.item.system.actionType === 'msak' || workflow.item.system.actionType === 'rsak') && workflow.hitTargets.size === 0) return;
		if (workflow.item.type != 'spell') return;
		let buttons = [
			{
				'label': 'Yes',
				'value': true
			}, {
				'label': 'No',
				'value': false
			}
		];
		let selection = await chris.selectTarget('Use Magical Inspiration?', buttons, targets, false);
		if (selection.buttons === false) return;
		let targetTokenID = selection.inputs.find(id => id != false);
		if (!targetTokenID) return;
		let targetDamage = workflow.damageList.find(i => i.tokenId === targetTokenID);
		let defaultDamageType = workflow.defaultDamageType;
		let roll = await new Roll(bardDice + '[' + defaultDamageType + ']').roll({async: true});
		roll.toMessage({
			rollMode: 'roll',
			speaker: {alias: name},
			flavor: 'Magical Inspiration'
		});
		let targetActor = canvas.scene.tokens.get(targetDamage.tokenId).actor;
		if (!targetActor) return;
		let hasDI = chris.checkTrait(targetActor, 'di', defaultDamageType);
		if (hasDI) return;
		let damageTotal = roll.total;
		let hasDR = chris.checkTrait(targetActor, 'dr', defaultDamageType);
		if (hasDR) damageTotal = Math.ceil(damageTotal / 2);
		targetDamage.damageDetail[0].push(
			{
				'damage': damageTotal,
				'type': defaultDamageType
			}
		);
		targetDamage.totalDamage += damageTotal;
		if (workflow.defaultDamageType === 'healing') {
			targetDamage.newHP += roll.total;
			targetDamage.hpDamage -= damageTotal;
			targetDamage.appliedDamage -= damageTotal;
		} else {
			targetDamage.appliedDamage += damageTotal;
			targetDamage.hpDamage += damageTotal;
			if (targetDamage.oldTempHP > 0) {
				if (targetDamage.oldTempHP >= damageTotal) {
					targetDamage.newTempHP -= damageTotal;
				} else {
					let leftHP = damageTotal - targetDamage.oldTempHP;
					targetDamage.newTempHP = 0;
					targetDamage.newHP -= leftHP;
				}
			} else {
				targetDamage.newHP -= damageTotal;
			}
		}
		await chris.removeEffect(effect);
		break;
	case 'preCheckHits':
		if (!effect) return;
		if (workflow.isFumble) return;
		let useFeature = await chris.dialog('Use Bardic Inspiration? (Attack Total: ' + workflow.attackTotal + ')', [['Yes', true], ['No', false]]);
		if (!useFeature) return;
		let updatedRoll = await chris.addToRoll(workflow.attackRoll, bardDice);
		workflow.setAttackRoll(updatedRoll);
		await chris.removeEffect(effect);
}