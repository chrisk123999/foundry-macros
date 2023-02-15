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
	'getSpellDC': function _getSpellDC(item) {
		let spellDC;
		let scaling = item.system.save.scaling;
		if (scaling === 'spell') {
			spellDC = item.actor.system.attributes.spelldc;
		} else {
			spellDC = item.actor.system.abilities[scaling].dc;
		}
		return spellDC;
	}
};
async function deleteSpells(actor, onlyEmpty) {
	let rossSpells =[];
	actor.items.forEach(item => {
		if (item.flags.world?.item?.ross?.isStored) rossSpells.push(item);
	});
	if (rossSpells.length === 0) return;
	for (let i of rossSpells) {
		if (onlyEmpty && i.system.uses.value) continue;
		await i.delete();
	}
}
let pickOption = await chris.dialog('Ring of Spell Storing', [['Store a spell.', 'store'], ['Toggle showing stored spells.', 'toggle'], ['Clear used spells.', 'clear'], ['Reset stored spells.', 'reset']]);
if (!pickOption) return;
let showSpells = this.item.flags.world?.item?.ross?.showSpells
if (showSpells === undefined) showSpells = true;
if (pickOption === 'store') {
	let storedSpellLevels = this.item.flags.world?.item?.ross?.spellSlots;
	if (!storedSpellLevels) storedSpellLevels = 0;
	if (storedSpellLevels === 5) {
		ui.notifications.info('Ring is full!');
		return;
	}
	let generatedMenu = [];
	this.actor.items.forEach(item => {
		let prepared = item.system.preparation?.prepared;
		let mode = item.system.preparation?.mode;
		let hasUses = true;
		let uses = Number(item.system.uses?.value || 0);
		let max = Number(item.system.uses?.max || 0);
		if (max > 0 && uses === 0) hasUses = false;
		if (mode === 'atwill' || mode === 'innate' || mode === 'pact') prepared = true;
		if (item.type === 'spell' && item.system.level > 0 && 5 - storedSpellLevels >= item.system.level && prepared && hasUses) generatedMenu.push(item);
	});
	if (generatedMenu.length === 0) {
		ui.notifications.info('No spells available to store!');
		return;
	}
	generatedMenu.sort((a, b) => a.name.localeCompare(b.name));
	let range = 0;
	let selectedSpell = false;
	let spellData;
	let spellDC;
	let spellMod = '';
	let originalSpell;
	while (!selectedSpell) {
		let listMenu = [];
		if (range != 0) listMenu.push(['- Previous -', 'previous']);
		let rangeTop = Math.min(range + 10, generatedMenu.length);
		for (let i = range; rangeTop > i; i++) {
			listMenu.push([generatedMenu[i].name, i]);
		}
		if (rangeTop != generatedMenu.length) listMenu.push(['- Next -', 'next']);
		let spellKey = await chris.dialog('Store what spell?', listMenu);
		if (!(spellKey || spellKey === 0)) return;
		if (spellKey === 'previous') {
			range -= 10;
		} else if (spellKey === 'next') {
			range += 10;
		} else {
			spellData = generatedMenu[spellKey].toObject();
			spellDC = chris.getSpellDC(generatedMenu[spellKey]);
			if (generatedMenu[spellKey].system.actionType === 'rsak' || generatedMenu[spellKey].system.actionType === 'msak') {
				let dummyWorkflow = await (new MidiQOL.DummyWorkflow(this.actor, generatedMenu[spellKey], this.token, new Set([this.token])).simulateAttack(this.token));
				spellMod = dummyWorkflow.attackRoll.formula.split('1d20')[1];
			}
			originalSpell = generatedMenu[spellKey];
			selectedSpell = true;
		}
	}
	let castLevel;
	if (spellData.system.preparation.mode === 'prepared' || spellData.system.preparation.mode === 'pact' || spellData.system.preparation.mode === 'always') {
		let generatedCastMenu = [];
		if (this.actor.system.spells.pact.value && 5 - storedSpellLevels >= this.actor.system.spells.pact.level && spellData.system.level <= this.actor.system.spells.pact.level) generatedCastMenu.push(['Pact', 'pact']);
		if (this.actor.system.spells.spell1.value && 5 - storedSpellLevels >= 1 && spellData.system.level <= 1) generatedCastMenu.push(['1st Level', 'spell1']);
		if (this.actor.system.spells.spell2.value && 5 - storedSpellLevels >= 2 && spellData.system.level <= 2) generatedCastMenu.push(['2nd Level', 'spell2']);
		if (this.actor.system.spells.spell3.value && 5 - storedSpellLevels >= 3 && spellData.system.level <= 3) generatedCastMenu.push(['3rd Level', 'spell3']);
		if (this.actor.system.spells.spell4.value && 5 - storedSpellLevels >= 4 && spellData.system.level <= 4) generatedCastMenu.push(['4th Level', 'spell4']);
		if (this.actor.system.spells.spell5.value && 5 - storedSpellLevels >= 5 && spellData.system.level <= 5) generatedCastMenu.push(['5th Level', 'spell5']);
		if (generatedCastMenu.length === 0) {
			ui.notifications.info('No spell slots available!');
			return;
		}
		let selection = await chris.dialog('Cast at what level?', generatedCastMenu);
		if (!selection) return;
		switch (selection) {
			case 'pact':
				castLevel = this.actor.system.spells.pact.level;
				break;
			case 'spell1':
				castLevel = 1;
				break;
			case 'spell2':
				castLevel = 2;
				break;
			case 'spell3':
				castLevel = 3;
				break;
			case 'spell4':
				castLevel = 4;
				break;
			case 'spell5':
				castLevel = 5;
				break;
		}
		await this.actor.update({['system.spells.' + selection +'.value']: this.actor.system.spells[selection].value - 1});
	} else {
		castLevel = spellData.system.level;
	}
	if (originalSpell.system.uses.max > 0) await originalSpell.update({'system.uses.value': originalSpell.system.uses.value - 1});
	spellData.name = 'Ring of Spell Storing: ' + spellData.name;
	spellData.system.uses.per = 'charges';
	spellData.system.uses.max = 1;
	spellData.system.uses.value = 1;
	spellData.system.preparation.mode = 'atwill';
	spellData.system.preparation.prepared = true;
	if (spellData.system.save.ability != '') {
		spellData.system.save.scaling = 'flat';
		spellData.system.save.dc = spellDC;
	}
	spellData.flags.world = {
		'item': {
			'ross': {
				'isStored': true,
				'castLevel': castLevel,
				'dc': spellDC,
				'mod': spellMod,
				'itemUuid': this.item.uuid
			}
		}
	};
	spellData.flags['custom-character-sheet-sections'] = {
		'sectionName': 'Ring of Spell Storing'
	};
	let testFlag = spellData.flags['midi-qol'];
	if (!testFlag) spellData.flags['midi-qol'] = {
		'onUseMacroName': '',
		'onUseMacroParts': {
			'items': []
		}
	};
	let onUseString = spellData.flags['midi-qol'].onUseMacroName;
	let appendString = '[preItemRoll]Chris-RingOfSpellStoringCast,[preCheckHits]Chris-RingOfSPellStoringAttack';
	if (onUseString === undefined) {
		spellData.flags['midi-qol'].onUseMacroName = appendString;
	} else {
		spellData.flags['midi-qol'].onUseMacroName = onUseString + ',' + appendString;
	}
	let onUseMacroParts = spellData.flags['midi-qol'].onUseMacroParts;
	if (!onUseMacroParts) onUseMacroParts = {'items': []};
	onUseMacroParts.items.push({
		'macroName': 'Chris-RingOfSpellStoringCast',
		'option': 'preItemRoll'
	});
	onUseMacroParts.items.push({
		'macroName': 'Chris-RingOfSPellStoringAttack',
		'option': 'preCheckHits'
	});
	spellData.flags['midi-qol'].onUseMacroParts = onUseMacroParts;
	let storedSpells = this.item.flags.world?.item?.ross?.storedSpells;
	if (!storedSpells) storedSpells = [];
	storedSpells.push(spellData);
	await this.item.setFlag('world', 'item.ross.storedSpells', storedSpells);
	let spellSlots = storedSpellLevels + castLevel;
	await this.item.setFlag('world', 'item.ross.spellSlots', spellSlots);
	if (showSpells) await this.actor.createEmbeddedDocuments('Item', [spellData]);
	await this.item.update({'name': 'Ring of Spell Storing (' + spellSlots + '/5)'});
	ui.notifications.info(originalSpell.name + ' stored.');
} else if (pickOption === 'toggle') {
	await this.item.setFlag('world', 'item.ross.showSpells', !showSpells);
	if (showSpells) {
		deleteSpells(this.actor);
		ui.notifications.info('Spells toggled off.');
	} else {
		let storedSpells = this.item.flags.world?.item?.ross?.storedSpells;
		if (!storedSpells) return;
		ui.notifications.info('Spells toggled on.');
		if (storedSpells.length === 0) return;
		for (let i of storedSpells) {
			i.flags.world.item.ross.itemUuid = this.item.uuid;
		}
		await this.actor.createEmbeddedDocuments('Item', storedSpells);
	}
} else if (pickOption === 'reset') {
	await this.item.setFlag('world', 'item.ross', {'storedSpells': [], 'spellSlots': 0, 'showSpells': true});
	if (showSpells) deleteSpells(this.actor);
	await this.item.update({'name': 'Ring of Spell Storing (0/5)'});
	ui.notifications.info('Ring Reset.');
} else if (pickOption === 'clear') {
	deleteSpells(this.actor, true);
	ui.notifications.info('Used spells cleared.');
}