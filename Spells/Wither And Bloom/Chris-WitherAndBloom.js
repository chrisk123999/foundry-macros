let chris = {
	'createEffect': async function _createEffect(actor, effectData) {
		if (game.user.isGM) {
			await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
		} else {
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
		}
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
	'functionToString': function _functiongToString(input) {
		return `(${input.toString()})()`;
	}
};
if (this.targets.size === 0) return;
let healTargets = [];
for (let target of this.damageList) {
	let targetToken = await fromUuid(target.tokenUuid);
	if (this.token.document.disposition != targetToken.disposition) continue;
	target.damageDetail = [
		{
			'damage': 0,
			'type': 'necrotic'
		}
	];
	target.totalDamage = 0;
	target.newHP = target.oldHP;
	target.hpDamage = 0;
	target.appliedDamage = 0;
	healTargets.push(targetToken.object);
}
if (healTargets.length === 0) return;
let buttons = [
	{
		'label': 'Yes',
		'value': true
	}, {
		'label': 'No',
		'value': false
	}
];
let selection = await chris.selectTarget('Heal a target?', buttons, healTargets, true);
if (!selection.buttons) return;
let targetTokenUuid = selection.inputs.find(id => id != false);
if (!targetTokenUuid) return;
async function effectMacro () {
	let chris = {
		'numberDialog': async function _numberDialog(title, buttons, options) {
			let inputs = [];
			for (let i of options) {
				inputs.push({
					'label': i,
					'type': 'number'
				});
			}
			let config = {
				'title': title
			};
			return await warpgate.menu(
				{
					'inputs': inputs,
					'buttons': buttons
				},
				config
			);
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
		'getSpellMod': function _getSpellMod(item) {
			let spellMod;
			let scaling = item.system.save.scaling;
			if (scaling === 'spell') {
				spellMod = item.actor.system.abilities[item.actor.system.attributes.spellcasting].mod;
			} else {
				spellMod = item.actor.system.abilities[scaling].mod;
			}
			return spellMod;
		}
	};
	if (actor.type != 'character') {
		effect.delete();
		return;
	}
	let classDice = [];
	let classes = actor.classes;
	for (let [key, value] of Object.entries(classes)) {
		let hitDiceAvailable = value.system.levels - value.system.hitDiceUsed;
		if (hitDiceAvailable != 0) classDice.push({
			'class': value.name,
			'hitDice': value.system.hitDice,
			'available': hitDiceAvailable,
			'max': value.system.levels
		});
	}
	if (classDice.length === 0) {
		effect.delete();
		return;
	}
	let inputs = [];
	let outputs = [];
	for (let i of classDice) {
		inputs.push(i.class + ' (' + i.hitDice + ') [' + i.available + '/' + i.max + ']:');
		outputs.push(
			{
				'class': i.class.toLowerCase(),
				'dice': i.hitDice
			}
		);
	}
	let buttons = [
		{
			'label': 'Yes',
			'value': true
		}, {
			'label': 'No',
			'value': false
		}
	];
	let maxHitDice = effect.flags.world.spell.witherAndBloom;
	let selection = await chris.numberDialog('Heal using hit dice? Max: ' + maxHitDice, buttons, inputs);
	if (!selection.buttons) {
		effect.delete();
		return;
	}
	let selectedTotal = 0;
	let healingFormula = '';
	for (let i = 0; selection.inputs.length > i; i++) {
		if (isNaN(selection.inputs[i])) continue;
		selectedTotal += selection.inputs[i];
		healingFormula = healingFormula + selection.inputs[i] + outputs[i].dice + '[healing] + ';
	}
	if (selectedTotal > maxHitDice) {
		ui.notifications.info('Too many hit dice selected!');
		effect.delete();
		return;
	}
	let conMod = actor.system.abilities.con.mod;
	let spellcastingMod = chris.getSpellMod(origin);
	healingFormula = healingFormula + '(' + selectedTotal + ' * ' + conMod + ') + ' + spellcastingMod;
	let healingRoll = await new Roll(healingFormula).roll({async: true});
	healingRoll.toMessage({
		rollMode: 'roll',
		speaker: {alias: name},
		flavor: 'Wither and Bloom'
	});
	chris.applyDamage([token], healingRoll.total, 'healing');
	for (let i = 0; selection.inputs.length > i; i++) {
		if (isNaN(selection.inputs[i])) continue;
		await actor.classes[outputs[i].class].update({
			'system.hitDiceUsed': actor.classes[outputs[i].class].system.hitDiceUsed + selection.inputs[i]
		});
	}
	effect.delete();
}
let effectData = {
	'label': this.item.name,
	'icon': this.item.img,
	'duration': {
		'seconds': 6
	},
	'origin': this.item.uuid,
	'flags': {
		'effectmacro': {
			'onCreate': {
				'script': chris.functionToString(effectMacro)
			}
		},
		'world': {
			'spell': {
				'witherAndBloom': this.castData.castLevel - 1
			}
		}
	}
};
let targetToken = await fromUuid(targetTokenUuid);
await chris.createEffect(targetToken.actor, effectData);