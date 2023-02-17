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
	'selectTarget': async function _selectTarget(title, buttons, targets, returnUuid, multiple) {
		let generatedInputs = [];
		let isFirst = true;
		for (let i of targets) {
			let name = i.document.name;
			let texture = i.document.texture.src;
			let html = `<img src="` + texture + `" id="` + i.id + `" style="width:40px;height:40px;vertical-align:middle;"><span> ` + name + `</span>`;
			let value = i.id;
			if (returnUuid) value = i.document.uuid;
			if (multiple) {
				generatedInputs.push({
					'label': html,
					'type': 'checkbox',
					'options': false,
					'value': value
				});
			} else {
				generatedInputs.push({
					'label': html,
					'type': 'radio',
					'options': ['group1', isFirst],
					'value': value
				});
				isFirst = false;
			}
		}
		function dialogRender(html) {
			let trs = html[0].getElementsByTagName('tr');
			for (let t of trs) {
				t.style.display = 'flex';
				t.style.flexFlow = 'row-reverse';
				t.style.alignItems = 'center';
				t.style.justifyContent = 'flex-end';
				if (!multiple) t.addEventListener('click', function () {t.getElementsByTagName('input')[0].checked = true});
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
		return actor.system.traits[type].value.has(trait);
	}
};
if (this.item.type != 'spell') return;
let pass = args[0].macroPass;
switch (pass) {
	case 'postDamageRoll':
		if (this.hitTargets.size != 1) return;
		let damageTypes = new Set();
		for (let i of this.damageDetail) {
			damageTypes.add(i.type);
		}
		if (!(damageTypes.has('fire') || damageTypes.has('radiant'))) return;
		let selected = await chris.dialog('Radiant Soul: Add what type of damage?', [['Radiant', '[radiant]'], ['Fire', '[fire]']]);
		if (!selected) selected = '[radiant]';
		let damageFormula = this.damageRoll._formula + ' + ' + this.actor.system.abilities.cha.mod + selected;
		let damageRoll = await new Roll(damageFormula).roll({async: true});
		await this.setDamageRoll(damageRoll);
		return;
	case 'preDamageApplication':
		if (this.hitTargets.size <= 1) return;
		let damageTypes2 = new Set();
		for (let i of this.item.system.damage.parts) {
			damageTypes2.add(i[1]);
		}
		if (!(damageTypes2.has('fire') || damageTypes2.has('radiant'))) return;
		let buttons = [
			{
				'label': 'Yes',
				'value': true
			}, {
				'label': 'No',
				'value': false
			}
		];
		let selection = await chris.selectTarget('Radiant Soul: Add extra damage?', buttons, this.targets);
		if (selection.buttons === false) return;
		let targetTokenID = selection.inputs.find(id => id != false);
		if (!targetTokenID) return;
		let targetDamage = this.damageList.find(i => i.tokenId === targetTokenID);
		let selected2 = await chris.dialog('Radiant Soul: What type of damage?', [['Radiant', 'radiant'], ['Fire', 'fire']]);
		if (!selected2) selected2 = 'radiant';
		let targetActor = canvas.scene.tokens.get(targetDamage.tokenId).actor;
		if (!targetActor) return;
		let hasDI = chris.checkTrait(targetActor, 'di', selected2);
		if (hasDI) return;
		let damageTotal = this.actor.system.abilities.cha.mod;
		let hasDR = chris.checkTrait(targetActor, 'dr', selected2);
		if (hasDR) damageTotal = Math.ceil(damageTotal / 2);
		targetDamage.damageDetail[0].push(
			{
				'damage': damageTotal,
				'type': selected2
			}
		);
		targetDamage.totalDamage += damageTotal;
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
		return;
}