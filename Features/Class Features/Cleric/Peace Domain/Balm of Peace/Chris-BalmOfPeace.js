if (this.targets.size === 0) return;
let areaSpellData = duplicate(this.item);
delete(areaSpellData.effects);
delete(areaSpellData.id);
delete(areaSpellData.flags['midi-qol'].onUseMacroName);
delete(areaSpellData.flags['midi-qol'].onUseMacroParts);
delete(areaSpellData.flags.itemacro);
areaSpellData.name = 'Balm of Peace - Healing';
areaSpellData.system.damage.parts = [['2d6[healing] + ' + this.actor.system.abilities.wis.mod, 'healing']];
areaSpellData.system.consume.amount = 0;
let areaSpell = new CONFIG.Item.documentClass(areaSpellData, {parent: this.actor});
for (let targetToken of this.targets.values()) {
    let options = {
        'showFullCard': false,
        'createWorkflow': true,
        'targetUuids': [targetToken.document.uuid],
        'configureDialog': false,
        'versatile': false,
        'consumeResource': false,
        'consumeSlot': false,
    };
    await MidiQOL.completeItemRoll(areaSpell, options);
}