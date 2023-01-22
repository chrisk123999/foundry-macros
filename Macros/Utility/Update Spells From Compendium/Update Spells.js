let actorID = 'Uqfj6K84fvhdToVg';
let dryRun = false;
packKey = 'world.automated-spells';

let sourceActor = game.actors.get(actorID);
if (!sourceActor) return;
let gamePack = game.packs.get(packKey);
if (!gamePack) return;
let packItems = await gamePack.getDocuments();
function getSpell (spellName) {
    let id = -1;
    for (let i = 0; packItems.length > i; i++) {
        if (packItems[i].name === spellName) {
            id = i;
            break;
        }
    }
    return id;
}
let itemSource = sourceActor.items._source;
for (let i = 0; itemSource.length > i; i++) {
    if (itemSource[i].type != 'spell') continue;
    let spellID = getSpell(itemSource[i].name);
    if (spellID === -1) continue;
    let oldSpell = sourceActor.items.get(itemSource[i]._id);
    ui.notifications.info('Updating ' + itemSource[i].name);
    if (!oldSpell) continue;
    let preparation = oldSpell.system.preparation;
    let uses = oldSpell.system.uses;
    let activation = oldSpell.system.activation;
    let fav = oldSpell.flags.favtab?.isFavorite;
    let updates = packItems[spellID].toObject();
    updates.system.preparation = preparation;
    updates.system.uses = uses;
    updates.system.activation = activation;
    if (fav === true) updates.flags.favtab = {
        'isFavorite': true
    };
    if (dryRun) {
        console.log(updates);
        continue;
    }
    await oldSpell.update(updates);
    warpgate.wait(500);
}
ui.notifications.info('Done updating spells.');