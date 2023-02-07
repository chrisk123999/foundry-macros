let chris = {
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
	'getSpellMod': function _getSpellMod(item) {
		let spellMod;
		let scaling = item.system.save.scaling;
		if (scaling === 'spell') {
			spellMod = item.actor.system.abilities[item.actor.system.attributes.spellcasting].mod;
		} else {
			spellMod = item.actor.system.abilities[scaling].mod;
		}
		return spellMod;
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
	}
};
if (this.targets.size === 0) return;
let sourceDisposition = this.token.document.disposition;
let targetTokens = [];
for (let i of this.targets) {
	if (i.document.disposition === sourceDisposition) targetTokens.push(i);
}
if (targetTokens.length === 0) return;
let diceNumber = 8 - this.castData.castLevel;
let damageFormula = diceNumber + 'd8[healing] + ' + chris.getSpellMod(this.item);
let damageRoll = await new Roll(damageFormula).roll({async: true});
if (targetTokens.length <= 6) {
	chris.applyDamage(targetTokens, damageRoll.total, 'healing');
} else {
	let buttons = [
		{
			'label': 'Yes',
			'value': true
		}, {
			'label': 'No',
			'value': false
		}
	];
	let selection = await chris.selectTarget('What targets would you like to heal? Max: 6', buttons, targetTokens, true, true);
	if (!selection.buttons) return;
	let selectedTokens = [];
	for (let i of selection.inputs) {
		if (i) selectedTokens.push(await fromUuid(i));
	}
	if (selectedTokens.length > 6) {
		ui.notifications.info('Too many targets selected!');
		return;
	}
	chris.applyDamage(selectedTokens, damageRoll.total, 'healing');
}
damageRoll.toMessage({
	rollMode: 'roll',
	speaker: {alias: name},
	flavor: this.item.name
});