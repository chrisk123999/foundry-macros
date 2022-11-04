function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
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
let useFeature = await showMenu('Attack roll (' + attackTotal + ') missed.  Use Focused Aim?', featureMenu);
if (useFeature === 0) return;
this.setAttackRoll(await new Roll(attackTotal + '+' + useFeature).evaluate({async: true}));
await this.attackRoll.render();
let otherFeature = await token.actor.items.getName('Focused Aim');
feature.update({'data.uses.value': featureUses - (useFeature / 2)});
otherFeature.roll();