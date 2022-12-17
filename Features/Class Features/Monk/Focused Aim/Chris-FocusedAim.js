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
    'addToRoll': async function _addToRoll(roll, addonFormula) {
        let addonFormulaRoll = await new Roll('0 + ' + addonFormula).evaluate({async: true});
        for (let i = 1; i < addonFormulaRoll.terms.length; i++) {
            roll.terms.push(addonFormulaRoll.terms[i]);
        }
        roll._total += addonFormulaRoll.total;
        roll._formula = roll._formula + ' + ' + addonFormula;
        return roll;
    }
};
if (this.targets.size != 1 || this.isFumble) return;
let feature = await token.actor.items.getName('Ki Points');
if (!feature) return;
let featureUses = feature.system.uses.value;
if (featureUses === 0) return;
let attackTotal = this.attackTotal;
let target = this.targets.first();
if (!target) return;
let targetAC = target.actor.system.attributes.ac.value;
if (targetAC <= attackTotal) return;
let featureMenu = [['Yes (1 Ki / +2 to hit)', 2]];
if (featureUses >= 2) featureMenu.push(['Yes (2 Ki / +4 to hit)', 4]);
if (featureUses >= 3) featureMenu.push(['Yes (3 Ki / +6 to hit)', 6]);
featureMenu.push(['No', 0]);
let useFeature = await chris.dialog('Attack roll (' + attackTotal + ') missed.  Use Focused Aim?', featureMenu);
if (useFeature === 0) return;
let updatedRoll = await chris.addToRoll(this.attackRoll, useFeature);
this.setAttackRoll(updatedRoll);
let otherFeature = await token.actor.items.getName('Focused Aim');
feature.update({'system.uses.value': featureUses - (useFeature / 2)});
await otherFeature.roll();
