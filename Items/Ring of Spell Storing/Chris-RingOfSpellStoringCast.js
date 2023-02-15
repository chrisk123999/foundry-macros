let chris = {
	'createEffect': async function _createEffect(actor, effectData) {
		if (game.user.isGM) {
			await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
		} else {
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
		}
	},
	'functionToString': function _functiongToString(input) {
		return `(${input.toString()})()`;
	}
};
this.config.consumeSpellSlot = false;
this.config.needsConfiguration = false;
this.options.configureDialog = false;
let castLevel = this.item.flags.world?.item?.ross?.castLevel;
if (!castLevel) return;
this.config.consumeSpellLevel = castLevel;
let sourceItemUuid = this.item.flags.world?.item?.ross?.itemUuid;
if (!sourceItemUuid) return;
let sourceItem = await fromUuid(sourceItemUuid);
if (!sourceItem) return;
let storedSpells = sourceItem.flags.world?.item?.ross?.storedSpells;
if (!storedSpells) storedSpells = [];
let arrayIndex = storedSpells.findIndex(i => i.name === this.item.name);
if (arrayIndex == -1) return;
storedSpells.splice(arrayIndex, 1);
await sourceItem.setFlag('world', 'item.ross.storedSpells', storedSpells);
let storedSpellLevels = sourceItem.flags.world?.item?.ross?.spellSlots;
if (!storedSpellLevels) storedSpellLevels = 0;
await sourceItem.setFlag('world', 'item.ross.spellSlots', storedSpellLevels - castLevel);
await sourceItem.update({'name': 'Ring of Spell Storing (' + (storedSpellLevels - castLevel) + '/5)'});
async function effectMacro () {
	if (!origin) return;
	await origin.delete();
}
let effectData = {
	'label': this.item.name + ' Deletion',
	'icon': '',
	'origin': this.item.uuid,
	'duration': {
		'seconds': 604800
	},
	flags: {
		'effectmacro': {
			'onDelete': {
				'script': chris.functionToString(effectMacro)
			}
		}
/*		  'dae': {
			'transfer': false,
			'specialDuration': [
				'longRest'
			],
			'stackable': 'multi',
			'macroRepeat': 'none'
		} */
	}
};
await chris.createEffect(this.actor, effectData);