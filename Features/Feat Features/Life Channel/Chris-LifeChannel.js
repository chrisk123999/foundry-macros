if (this.failedSaves.size != 1) return;
if (this.item.type != 'spell') return;
if (this.item.system.save?.ability === '') return;
if (this.item.system.save?.dc === null) return;
let castLevel = this.castData.castLevel;
if (castLevel === 0) return;
let actor = this.actor;
let conMod = actor.system.abilities.con.mod;
let hitDice = {
    'd6': 0,
    'd8': 0,
    'd10': 0,
    'd12': 0
};
let classes = actor.classes;
for (let [key, value] of Object.entries(classes)) {
    hitDice[value.system.hitDice] += value.system.levels - value.system.hitDiceUsed;
}
let inputs = [];
let outputs = [];
if (hitDice.d6 != 0) {
    inputs.push({
        'label': 'd6 (Available: ' + hitDice.d6 + ')',
        'type': 'number'
    });
    outputs.push('d6');
}
if (hitDice.d8 != 0) {
    inputs.push({
        'label': 'd8 (Available: ' + hitDice.d8 + ')',
        'type': 'number'
    });
    outputs.push('d8');
}
if (hitDice.d10 != 0) {
    inputs.push({
        'label': 'd10 (Available: ' + hitDice.d10 + ')',
        'type': 'number'
    });
    outputs.push('d10');
}
if (hitDice.d12 != 0) {
    inputs.push({
        'label': 'd12 (Available: ' + hitDice.d12 + ')',
        'type': 'number'
    });
    outputs.push('d12');
}
if (inputs.length === 0) {
    ui.notifications.info('No hit dice available!');
    return;
}
let selected = await warpgate.menu({
        inputs
    },
    {
        'title': 'How many hit dice do you want to use? (Max: ' + castLevel + ')'
    }
);
console.log(selected);
if (!selected.buttons) return;
let selectedTotal = 0;
for (let i = 0; selected.inputs.length > i; i++) {
    if (isNaN(selected.inputs[i])) continue;
    selectedTotal += selected.inputs[i];
}
if (selectedTotal > castLevel) {
    ui.notifications.info('Too many hit dice selected!');
    return;
}
let defaultDamageType = this.defaultDamageType;
let bonusFormula = '';
for (let i = 0; outputs.length > i; i++) {
    if (isNaN(selected.inputs[i])) continue;
    bonusFormula = bonusFormula + ' + ' + selected.inputs[i] + outputs[i] + '[' + defaultDamageType + '] + ' + (conMod * selected.inputs[i]);
}
//console.log(bonusFormula);
let damageFormula = this.damageRoll._formula + bonusFormula;
this.damageRoll = await new Roll(damageFormula).roll({async: true});
this.damageTotal = this.damageRoll.total;
this.damageRollHTML = await this.damageRoll.render();
for (let i = 0; outputs.length > i; i++) {
    if (isNaN(selected.inputs[i])) continue;
    for (let j = 0; selected.inputs[i] > j; j++) {
        for (let [key, value] of Object.entries(classes)) {
            if (value.system.hitDice != outputs[i]) continue;
            let diceLeft = value.system.levels - value.system.hitDiceUsed;
            if (diceLeft === 0) continue;
//            console.log('Found ' + outputs[i] + ' hit dice to use: ' + value.name);
            await value.update({
                'system.hitDiceUsed': value.system.hitDiceUsed + 1
            });
            break;
        }
    }
}