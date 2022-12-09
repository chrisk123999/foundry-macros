function chris = {
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
    }
};
let actor = args[0].actor;
let spells = actor.system.spells;
let highestSpellLevel = 0;
let levelMenu = [['Cantrip (DC: 10)', 0]];
let selectionLevelMenu = [];
if (spells.spell1.max > 0) {
    highestSpellLevel = 1;
    levelMenu.push(['1st Level (DC: 12)', 1]);
}
if (spells.spell2.max > 0) {
    highestSpellLevel = 2;
    levelMenu.push(['2nd Level (DC: 14)', 2]);
}
if (spells.spell3.max > 0) {
    highestSpellLevel = 3;
    levelMenu.push(['3rd Level (DC: 16)', 3]);
}
if (spells.spell4.max > 0) {
    highestSpellLevel = 4;
    levelMenu.push(['4th Level (DC: 18)', 4]);
}
if (spells.spell5.max > 0) {
    highestSpellLevel = 5;
    levelMenu.push(['5th Level (DC: 20)', 5]);
}
if (spells.spell6.max > 0) {
    highestSpellLevel = 6;
    levelMenu.push(['6th Level (DC: 22)', 6]);
}
if (spells.spell7.max > 0) {
    highestSpellLevel = 7;
    levelMenu.push(['7th Level (DC: 24)', 7]);
}
if (spells.spell8.max > 0) {
    highestSpellLevel = 8;
    levelMenu.push(['8th Level (DC: 26)', 8]);
}
if (spells.spell9.max > 0) {
    highestSpellLevel = 9;
    levelMenu.push(['9th Level (DC: 28)', 9]);
}
let levelSelection = await chris.dialog('What level are you casting at?', levelMenu);
if (levelSelection === undefined) return;
switch (levelSelection) {
    case 9:
        selectionLevelMenu.unshift(['9th Level', 9]);
    case 8:
        selectionLevelMenu.unshift(['8th Level', 8]);
    case 7:
        selectionLevelMenu.unshift(['7th Level', 7]);
    case 6:
        selectionLevelMenu.unshift(['6th Level', 6]);
    case 5:
        selectionLevelMenu.unshift(['5th Level', 5]);
    case 4:
        selectionLevelMenu.unshift(['4th Level', 4]);
    case 3:
        selectionLevelMenu.unshift(['3rd Level', 3]);
    case 2:
        selectionLevelMenu.unshift(['2nd Level', 2]);
    case 1:
        selectionLevelMenu.unshift(['1st Level', 1]);
        break;
    case 0:
        selectionLevelMenu = [['Cantrip', 'c']];
        break;
}
let arcanaDC = 10 + (levelSelection*2);
let arcanaCheck = await actor.rollSkill('arc', {});
let spellData;
if (arcanaCheck.total < arcanaDC) {
    let failurePack;
    switch (levelSelection) {
        case 0:
            return;
        case 1:
            failurePack = 'world.mafailure1';
            break;
        case 2:
            failurePack = 'world.mafailure2';
            break;
        case 3:
            failurePack = 'world.mafailure3';
            break;
        case 4:
            failurePack = 'world.mafailure4';
            break;
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            failurePack = 'world.mafailure5';
            break;
    }
    let pack = game.packs.get(failurePack);
    if (!pack) return;
    let packItems = await pack.getDocuments();
    if (packItems.length === 0) return;
    let packDice = 1 + 'd' + packItems.length;
    let packRoll = await new Roll(packDice).roll({async: true});
    packRoll.toMessage({
        rollMode: 'roll',
        speaker: {alias: name},
        flavor: 'Spell: ' + packItems[packRoll.total - 1].name
    });
    spellData = packItems[packRoll.total - 1];
} else {
    let classSelectionMenu = [];
    let cleric = actor.classes.cleric;
    let sorcerer = actor.classes.sorcerer;
    let wizard = actor.classes.wizard;
    if (actor.items.getName('Izzet Engineer')) classSelectionMenu.push(['Izzet League', 'izzet']);
    if (cleric) classSelectionMenu.push(['Cleric', 'cleric']);
    if (sorcerer) classSelectionMenu.push(['Sorcerer', 'sorcerer']);
    if (wizard) classSelectionMenu.push(['Wizard', 'wizard']);
    if (actor.items.getName('Mark of Making Human')) classSelectionMenu.push(['Mark of Making', 'making']);
    if (classSelectionMenu.length === 0) return;
    if (classSelectionMenu.length > 1) selectionLevelMenu.unshift(['- Back -', 'back']);
    let selectedSpell = false;
    let spellLevel = -1;
    let classSelection = '';
    let packItems;
    let range = 0;
    let selectedMenu = 'class selection';
    while (!selectedSpell) {
        switch (selectedMenu) {
            case 'class selection':
                if (classSelectionMenu.length === 1) classSelection = classSelectionMenu[0][1];
                if (classSelection === '') classSelection = await chris.dialog('What spell list?', classSelectionMenu);
                if (!classSelection) return;
                selectedMenu = 'level selection';
                break;
            case 'level selection':
                if (selectionLevelMenu.length === 1) spellLevel = selectionLevelMenu[0][1];
                if (spellLevel === -1) spellLevel = await chris.dialog('What is the spell\'s lowest level?', selectionLevelMenu);
                if (!spellLevel) return;
                if (spellLevel === 'back') {
                    spellLevel = -1;
                    classSelection = '';
                    selectedMenu = 'class selection';
                } else {
                    selectedMenu = 'load pack';
                }
                break;
            case 'load pack':
                let packName = 'world.ma' + classSelection + spellLevel;
                let pack = game.packs.get(packName);
                if (!pack) return;
                packItems = await pack.getDocuments();
                if (packItems.length === 0) return;
                selectedMenu = 'show list';
                break;
            case 'show list':
                let listMenu = [['- Back -', 'back']];
                if (range != 0) listMenu.push(['- Previous -', 'previous']);
                let rangeTop = Math.min(range + 10, packItems.length);
                for (let i = range; rangeTop > i; i++) {
                    listMenu.push([packItems[i].name, i]);
                }
                if (rangeTop != packItems.length) listMenu.push(['- Next -', 'next']);
                let spellKey = await chris.dialog('What spell?', listMenu);
                if (!(spellKey || spellKey === 0)) return;
                if (spellKey === 'back') {
                    selectedMenu = 'level selection';
                    range = 0;
                    spellLevel = -1;
                } else if (spellKey === 'previous') {
                    range -= 10;
                } else if (spellKey === 'next') {
                    range += 10;
                } else {
                    spellData = packItems[spellKey];
                    selectedSpell = true;
                }
                break;
        }
    }
}
if (actor.items.getName(spellData.name)) return;
let updates = {
    'embedded': {
        'Item': {
            ['Mizzium Apparatus: ' + spellData.name]: spellData
        }
    }
};
let options = {
    'permanent': false,
    'name': 'Mizzium Apparatus: ' + spellData.name,
    'description': 'Mizzium Apparatus: ' + spellData.name
};
let tokenDoc = args[0].workflow.token.document;
if (!tokenDoc) return;
let mutationStack = warpgate.mutationStack(tokenDoc);
let mutateItem = mutationStack.getName('Mizzium Apparatus: ' + spellData.name);
if (mutateItem) return;
await warpgate.mutate(tokenDoc, updates, {}, options);
Hooks.once("dnd5e.restCompleted", () => {
    warpgate.revert(tokenDoc, 'Mizzium Apparatus: ' + spellData.name);
});