window.chris = {
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
    'findEffect': function _findEffect(actor, name) {
        return actor.effects.find(eff => eff.label === name);
    },
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    },
    'removeEffect': async function _removeEffect(effect) {
        if (game.user.isGM) {
            await effect.delete();
        } else {
            await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': effect.parent.uuid, 'effects': [effect.id]});
        }
    },
    'updateEffect': async function _updateEffect(effect, updates) {
        if (game.user.isGM) {
            await effect.update(updates);
        } else {
            updates._id = effect.id;
            await MidiQOL.socket().executeAsGM('updateEffects', {'actorUuid': effect.parent.uuid, 'updates': [updates]});
        }
    },
    'addCondition': async function _addCondition(actor, name, overlay, origin) {
        await game.dfreds.effectInterface.addEffect(
            {
                'effectName': name,
                'uuid': actor.uuid,
                'origin': origin,
                'overlay': overlay
            }
        );
    },
    'removeCondition': async function _removeCondition(actor, name) {
        await game.dfreds.effectInterface.removeEffect(
            {
                'effectName': name,
                'uuid': actor.uuid
            }
        );
    },
    'applyDamage': async function _applyDamage(tokenList, damageValue, damageType) {
        let targets;
        if (Array.isArray(tokenList)) {
            targets = new Set(tokenList);
        } else {
            targets = new Set([tokenList]);
        }
        await MidiQOL.applyTokenDamage(
            [
                {
                    damage: damageValue,
                    type: damageType
                }
            ],
            damageValue,
            targets,
            null,
            null
        );
    },
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
    'addToRoll': async function _addToRoll(roll, addonFormula) {
        let addonFormulaRoll = await new Roll('0 + ' + addonFormula).evaluate({async: true});
        for (let i = 1; i < addonFormulaRoll.terms.length; i++) {
            roll.terms.push(addonFormulaRoll.terms[i]);
        }
        roll._total += addonFormulaRoll.total;
        roll._formula = roll._formula + ' + ' + addonFormula;
        return roll;
    },
    'getSpellDC': function _getSpellDC(item) {
        let spellDC;
        let scaling = item.system.save.scaling;
        if (scaling === 'spell') {
            spellDC = item.actor.system.attributes.spelldc;
        } else {
            spellDC = item.actor.system.abilities[scaling].dc;
        }
        return spellDC;
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
        function dialogRender() {
            let ths = document.querySelector('.dialog-content').getElementsByTagName('th');
            for (let t of ths) {
                t.style.width = "auto";
                t.style.textAlign = "left";
            }
            let tds = document.querySelector('.dialog-content').getElementsByTagName('td');
            for (let t of tds) t.style.width = "50px";
        }
        let config = {
            'title': title,
            'render': dialogRender
        };
        return await warpgate.menu(
            {
                'inputs': generatedInputs,
                'buttons': buttons
            },
            config
        );
    },
    'checkTrait': function _checkTrait(actor, type, trait) {
        return actor.system.traits[type].value.indexOf(trait) > -1;
    }
};