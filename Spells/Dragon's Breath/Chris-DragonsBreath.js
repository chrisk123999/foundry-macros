console.log(args);
function showMenu(title, options) {
    return game.macros.getName('Chris-WarpgateMenuHelper').execute(title, options);
}
if (args[0].targets.length != 1) return;
let targetTokenID = args[0].targets[0].id;
let spellLevel = args[0].castData.castLevel;
let spellDC = args[0].actor.system.attributes.spelldc;
let damageType = await showMenu('What damage type?', [['🧪 Acid', 'acid'], ['❄️ Cold', 'cold'], ['🔥 Fire', 'fire'], ['⚡ Lightning', 'lightning'], ['☠️ Poison', 'poison']]);
if (!damageType) return;
game.macros.getName('Chris-DragonsBreathGM').execute(targetTokenID, spellLevel, damageType, spellDC);