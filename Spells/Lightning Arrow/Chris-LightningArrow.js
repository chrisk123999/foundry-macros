let compendiumKey = 'world.automated-spells';
let chris = {
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
	},
	'getItemFromCompendium': async function _getItemFromCompendium(key, name, ignoreNotFound) {
		let gamePack = game.packs.get(key);
		if (!gamePack) {
			ui.notifications.warn('Invalid compendium specified!');
			return false;
		}
		let packItems = await gamePack.getDocuments();
		let itemData = packItems.find(item => item.name === name);
		if (!itemData) {
			if (!ignoreNotFound) ui.notifications.warn('Item not found in specified compendium! Check spelling?');
			return false;
		}
		return itemData.toObject();
	}
};
if (this.targets.size != 1) return;
let targetToken = this.targets.first();
if (!(this.item.system.properties.thr || this.item.system.actionType === 'rwak')) return;
let diceNumber = 4;
if (this.isCritical) diceNumber = 8;
let modifier = this.actor.system.abilities[this.item.system.ability].mod;
let damageFormula = diceNumber + 'd8[lightning] + ' + modifier;
let effect = chris.findEffect(this.actor, 'Lightning Arrow');
let castLevel = 3;
if (effect) {
	castLevel = effect.flags['midi-qol'].castData.castLevel;
	let extraDiceNumber = castLevel - 3;
	if (this.isCritical) extraDiceNumber = extraDiceNumber * 2;
	if (castLevel > 3) damageFormula = damageFormula + ' + ' + extraDiceNumber + 'd8[lightning]';
}
let damageRoll = await new Roll(damageFormula).roll({async: true});
await this.setDamageRoll(damageRoll);
if (this.hitTargets.size === 0) await chris.applyDamage([targetToken], Math.ceil(damageRoll.total / 2), 'lightning');
let itemData = await chris.getItemFromCompendium(compendiumKey, 'Lightning Arrow - Burst', false);
if (!itemData) {
	if (effect) effect.delete();
	return;
}
let saveDiceNumber = castLevel - 1;
itemData.system.damage.parts = [
	[
		saveDiceNumber + 'd8[lightning]',
		'lightning'
	]
];
if (effect) {
	let originItem = await fromUuid(effect.origin);
	itemData.system.save.dc = chris.getSpellDC(originItem);
}
let areaFeature = new CONFIG.Item.documentClass(itemData, {parent: this.actor});
let newTargets = chris.findNearby(targetToken, 10, null);
newTargets.push(targetToken);
let newTargetUuids =[];
for (let i of newTargets) {
	newTargetUuids.push(i.document.uuid);
}
let options = {
	'showFullCard': false,
	'createWorkflow': true,
	'targetUuids': newTargetUuids,
	'configureDialog': false,
	'versatile': false,
	'consumeResource': false,
	'consumeSlot': false,
};
await MidiQOL.completeItemUse(areaFeature, {}, options);
if (effect) effect.delete();