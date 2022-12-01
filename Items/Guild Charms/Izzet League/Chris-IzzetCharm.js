function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
let slot1Value = actor.system.spells.spell1.value;
let slot1Max = actor.system.spells.spell1.max;
let slot2Value = actor.system.spells.spell2.value;
let slot2Max = actor.system.spells.spell2.max;
let slot3Value = actor.system.spells.spell3.value;
let slot3Max = actor.system.spells.spell3.max;
let options = [];
if (slot1Value < slot1Max) options.push(['1st Level', 1]);
if (slot2Value < slot2Max) options.push(['2nd Level', 2]);
if (slot3Value < slot3Max) options.push(['3rd Level', 3]);
if (options.length === 0) return;
let selected = await showMenu('What spell slot do you want to regain?', options);
if (!selected) return;
switch (selected) {
    case 1:
        await actor.update({'system.spells.spell1.value': slot1Value + 1});
        return;
    case 2:
        await actor.update({'system.spells.spell2.value': slot2Value + 1});
        return;
    case 3:
        await actor.update({'system.spells.spell3.value': slot3Value + 1});
        return;
}