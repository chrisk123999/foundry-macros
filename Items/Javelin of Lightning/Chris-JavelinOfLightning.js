let pass = args[0].macroPass;
let workflow = args[0].workflow;
if (workflow.targets.size != 1) return;
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
    'createEffect': async function _createEffect(actor, effectData) {
        if (game.user.isGM) {
            await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        } else {
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
        }
    }
};
let item = workflow.item;
if (pass === 'postActiveEffects') {
    if (!item.flags.world?.useBolt) return;
    await item.setFlag('world', 'useBolt', false);
    let targetToken = workflow.targets.first();
    let sourceToken = workflow.token;
    let effectData = {
        'label': 'Javelin Of Lightning Recharge - ' + item.id,
        'icon': 'icons/weapons/polearms/javelin-hooked.webp',
        'flags': {
            'dae': {
                'specialDuration': [
                    'newDay'
                ]
            },
            'effectmacro': {
                'onDelete': {
                    'script': "let item = actor.items.get('" + item.id + "');\nawait item.setFlag('world', 'boltUsed', false);"
                }
            }
        }
    };
    await chris.createEffect(sourceToken.actor, effectData);
    await item.setFlag('world', 'boltUsed', true);
    let ray = new Ray(sourceToken.center, targetToken.center);
    if (ray.distance === 0) return;
    let templateData = {
        'angle': 0,
        'direction': Math.toDegrees(ray.angle),
        'distance': ray.distance / canvas.scene.grid.size * 5,
        'x': ray.A.x,
        'y': ray.A.y,
        't': 'ray',
        'user': game.user,
        'fillColor': game.user.color,
        'width': 5,
        'flags': {
            'tokenmagic': {
                'options': {
                    'tmfxPreset': 'Shock',
                    'tmfxTextureAlpha': 0.5
                }
            }
        }
    };
    let changes = await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]);
    let templateDoc = changes[0];
    let effectData2 = {
        'label': 'Javelin Of Lightning: Bolt Template',
        'icon': 'icons/magic/lightning/bolt-forked-large-blue-yellow.webp',
        'changes': [
            {
                'key': 'flags.dae.deleteUuid',
                'mode': 5,
                'priority': 20,
                'value': templateDoc.uuid
            }
        ],
        'duration': {
            'seconds': 1
        }
    };
    await chris.createEffect(sourceToken.actor, effectData2);
    let templateMacro = game.modules.get('templatemacro').api;
    let containedTokens = templateMacro.findContained(templateDoc);
    let targetTokens = [];
    for (let i of containedTokens) {
        if (i === sourceToken.id || i === targetToken.id) continue;
        targetTokens.push(canvas.scene.tokens.get(i).uuid);
    }
    if (targetTokens.length != 0) {
        let areaSpellData = duplicate(workflow.item);
        delete(areaSpellData.effects);
        delete(areaSpellData.id);
        delete(areaSpellData.flags['midi-qol'].onUseMacroName);
        delete(areaSpellData.flags['midi-qol'].onUseMacroParts);
        delete(areaSpellData.flags.itemacro);
        areaSpellData.name = 'Javelin of Lightning: Bolt';
        areaSpellData.system.damage.parts = [['4d6[lightning]', 'lightning']];
        areaSpellData.system.actionType = 'save';
        areaSpellData.system.save.ability = 'dex';
		areaSpellData.system.save.dc = 13;
		areaSpellData.system.save.scaling = 'flat';
        let areaSpell = new CONFIG.Item.documentClass(areaSpellData, {parent: workflow.actor});
        let options = {
            'showFullCard': false,
            'createWorkflow': true,
            'targetUuids': targetTokens,
            'configureDialog': false,
            'versatile': false,
            'consumeResource': false,
            'consumeSlot': false,
        };
        await MidiQOL.completeItemRoll(areaSpell, options);
    }
} else if (pass === 'postDamageRoll') {
    if (!item.flags.world?.useBolt) return;
    let diceNum = 4;
    if (workflow.isCritical) diceNum = 8;
    let formula = workflow.damageRoll._formula + '+ ' + diceNum + 'd4[lightning]';
    let damageRoll = await new Roll(formula).roll({async: true});
    await workflow.setDamageRoll(damageRoll);
} else if (pass === 'preAttackRoll') {
    let boltUsed = item.flags.world?.boltUsed;
    if (boltUsed === true) return;
    let selection = await chris.dialog('Use Bolt of Lightning?', [['Yes', true], ['No', false]]);
    if (!selection) return;
    await item.setFlag('world', 'useBolt', true);
}