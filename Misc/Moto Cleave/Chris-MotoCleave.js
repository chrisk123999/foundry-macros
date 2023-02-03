let chris = {
    'findNearby': function _findNearby(tokenDoc, range, disposition) {
        let dispositionValue;
        switch (disposition) {
            case 'ally':
                dispositionValue = 1;
                break;
            case 'neutral':
                dispositionValue = 0;
                break;
            case 'enemy':
                dispositionValue = -1;
                break;
            default:
                dispositionValue = null;
        }
        return MidiQOL.findNearby(dispositionValue, tokenDoc, range);
    },
    'selectTarget': async function _selectTarget(title, buttons, targets, returnUuid) {
        let generatedInputs = [];
        let isFirst = true;
        for (let i of targets) {
            let name = i.document.name;
            let texture = i.document.texture.src;
            let html = `<img src="` + texture + `" style="width:40px;height:40px;vertical-align:middle;"><span> ` + name + `</span>`;
            let value = i.id;
            if (returnUuid) value = i.document.uuid;
            generatedInputs.push({
                'label': html,
                'type': 'radio',
                'options': ['group1', isFirst],
                'value': value
            });
            isFirst = false;
        }
        let config = {
            'title': title,
        };
        return await warpgate.menu(
            {
                'inputs': generatedInputs,
                'buttons': buttons
            },
            config
        );
    }
};
//console.log(this);
if (this.hitTargets.size != 1) return;
if (this.item.system.actionType != 'mwak') return;
let newHP = this.damageList[0].newHP;
if (newHP != 0) return;
let oldHP = this.damageList[0].oldHP;
let leftoverDamage = this.damageList[0].appliedDamage - (oldHP - newHP);
//console.log(leftoverDamage);
if (leftoverDamage === 0) return;
let sourceNearbyTargets = chris.findNearby(this.token, 5, 'enemy');
let targetNearbyTargets = chris.findNearby(this.targets.first(), 5, 'ally');
//console.log(sourceNearbyTargets);
//console.log(targetNearbyTargets);
if (sourceNearbyTargets.length === 0 || targetNearbyTargets.length === 0) return;
let overlappingTargets = targetNearbyTargets.filter(function (obj) {
    return sourceNearbyTargets.indexOf(obj) !== -1;
});
//console.log(overlappingTargets);
if (overlappingTargets.length === 0) return;
let buttons = [
    {
        'label': 'Yes',
        'value': true
    }, {
        'label': 'No',
        'value': false
    }
];
let selection = await chris.selectTarget('Cleave nearby target?', buttons, overlappingTargets, true);
if (selection.buttons === false) return;
let targetTokenID = selection.inputs.find(id => id != false);
if (!targetTokenID) return;
//console.log(targetTokenID);
let weaponData = duplicate(this.item);
delete(weaponData.effects);
delete(weaponData.id);
weaponData.flags['midi-qol'].onUseMacroName = '[preCheckHits]ItemMacro';
weaponData.flags['midi-qol'].onUseMacroParts = {
'items': [
        {
            'macroName': 'ItemMacro',
            'option': 'preCheckHits'
        }
    ]
};
weaponData.flags.itemacro = {
    'macro': {
        'name': this.item.name,
        'type': 'script',
        'scope': 'global',
        'command': `let roll = await new Roll('` + this.attackTotal + `').evaluate({async: true});\nthis.setAttackRoll(roll);`,
        'author': game.userId,
        '_id': null,
        'img': 'icons/svg/dice-target.svg',
        'folder': null,
        'sort': 0,
        'ownership': {
            'default': 0
        },
        'flags': {},
        '_stats': {
            'systemId': null,
            'systemVersion': null,
            'coreVersion': null,
            'createdTime': null,
            'modifiedTime': null,
            'lastModifiedBy': null
        }
    }
};
weaponData.name = this.item.name + ': Cleave';
weaponData.system.damage.parts = [[Math.ceil(leftoverDamage / 2) + '[' + this.defaultDamageType + ']', this.defaultDamageType]];
weaponData.system.consume.amount = 0;
let weaponAttack = new CONFIG.Item.documentClass(weaponData, {parent: this.actor});
//console.log(weaponAttack);
let options = {
    'showFullCard': false,
    'createWorkflow': true,
    'targetUuids': [targetTokenID],
    'configureDialog': false,
    'versatile': false,
    'consumeResource': false,
    'consumeSlot': false,
};
await MidiQOL.completeItemRoll(weaponAttack, options);