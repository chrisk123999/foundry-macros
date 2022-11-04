function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
let selection = await showMenu('What condition would you like to remove?', [['Charmed', 'Charmed'], ['Frightened', 'Frightened']]);
if (!selection) return;
await game.dfreds.effectInterface.removeEffect({effectName: selection, uuid: args[0].actor.uuid});