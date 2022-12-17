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
    }
};
let type = this.item.type;
if (type != 'spell') return;
let school = this.item.system.school;
if (school != 'div') return;
let level = this.item.system.level;
if (level < 2) return;
let missingFirst = this.actor.system.spells.spell1.max - this.actor.system.spells.spell1.value;
let missingSecond = this.actor.system.spells.spell2.max - this.actor.system.spells.spell2.value;
let missingThird = this.actor.system.spells.spell3.max - this.actor.system.spells.spell3.value;
let missingFourth = this.actor.system.spells.spell4.max - this.actor.system.spells.spell4.value;
let missingFifth = this.actor.system.spells.spell5.max - this.actor.system.spells.spell5.value;
let menu = [];
if (level > 1 && missingFirst > 0) menu.push(['1st Level', 1]);
if (level > 2 && missingSecond > 0) menu.push(['2nd Level', 2]);
if (level > 3 && missingThird > 0) menu.push(['3rd Level', 3]);
if (level > 4 && missingFourth > 0) menu.push(['4th Level', 4]);
if (level > 5 && missingFifth > 0) menu.push(['5th Level', 5]);
if (menu.length === 0) return;
let slot = await chris.dialog('What level spell slot do you want to regain?', menu);
if (!slot) return;
let updateString = '';
let updateValue = 0;
switch (slot) {
    case 1:
        updateString = 'system.spells.spell1.value';
        updateValue = this.actor.system.spells.spell1.value + 1;
        break;
    case 2:
        updateString = 'system.spells.spell2.value';
        updateValue = this.actor.system.spells.spell2.value + 1;
        break;
    case 3:
        updateString = 'system.spells.spell3.value';
        updateValue = this.actor.system.spells.spell3.value + 1;
        break;
    case 4:
        updateString = 'system.spells.spell4.value';
        updateValue = this.actor.system.spells.spell4.value + 1;
        break;
    case 5:
        updateString = 'system.spells.spell5.value';
        updateValue = this.actor.system.spells.spell5.value + 1;
        break;
}
this.actor.update({[updateString]: updateValue});
await ChatMessage.create({content: 'Regained a spell slot!', flavor: 'Expert Divination'});