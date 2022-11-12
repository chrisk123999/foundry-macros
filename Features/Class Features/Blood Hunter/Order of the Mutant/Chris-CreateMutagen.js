function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
let actor = args[0].actor;
let bloodHunterLevels = actor.classes['blood-hunter'].system.levels;
let createNumber = 1;
if (bloodHunterLevels > 6) createNumber += 1;
if (bloodHunterLevels > 14) createNumber += 1;
let items = actor.items;
let options = {};
options.celerity = items.getName('Formulas: Celerity');
options.deftness = items.getName('Formulas: Deftness');
options.mobility = items.getName('Formulas: Mobility');
options.nighteye = items.getName('Formulas: Nighteye');
options.rapidity = items.getName('Formulas: Rapidity');
options.reconstruction = items.getName('Formulas: Reconstruction');
let createOptions = [];
if (options.celerity) createOptions.push(['Celerity', 'celerity']);
if (options.deftness) createOptions.push(['Deftness', 'deftness']);
if (options.mobility) createOptions.push(['Mobility', 'mobility']);
if (options.nighteye) createOptions.push(['Nighteye', 'nighteye']);
if (options.rapidity) createOptions.push(['Rapidity', 'rapidity']);
if (options.reconstruction) createOptions.push(['Reconstruction', 'reconstruction']);
for (let i = 0; i < createNumber; i++) {
    let selected = await showMenu('What Mutagen would you like to create?', createOptions);
    if (!selected) continue;
    options[selected].update({'system.uses.value': options[selected].system.uses.value + 1});
}
Hooks.once("dnd5e.restCompleted", () => {
    let optionKeys = Object.keys(options);
    for (let i = 0; i < optionKeys.length; i++) {
        options[optionKeys[i]].update({'system.uses.value': 0});
    }
});