let chris = {
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
if (this.targets.size != 1) return;
if (this.item.type != 'spell' || this.item.system.level != 0 || this.item.system.school != 'nec' || this.item.flags.world?.reap) return;
let targetToken = this.targets.first();
let nearbyTargets = chris.findNearby(targetToken, 5, 'ally');
if (nearbyTargets.length === 0) return;
let buttons = [
	{
		'label': 'Yes',
		'value': true
	}, {
		'label': 'No',
		'value': false
	}
];
let selected = await chris.selectTarget('Use Reaper?', buttons, nearbyTargets, true, false);
if (selected.buttons === false) return;
let targetTokenUuid = selected.inputs.find(id => id != false);
if (!targetTokenUuid) return;
let feature = this.actor.items.getName('Reaper');
if (feature) await feature.roll();
let options = {
	'showFullCard': false,
	'createWorkflow': true,
	'targetUuids': [targetTokenUuid],
	'configureDialog': false,
	'versatile': false,
	'consumeResource': false,
	'consumeSlot': false,
};
let spellData = duplicate(this.item.toObject());
spellData.flags.world = {
	'reap': true
};
let spell = new CONFIG.Item.documentClass(spellData, {parent: this.actor});
await MidiQOL.completeItemUse(spell, {}, options);