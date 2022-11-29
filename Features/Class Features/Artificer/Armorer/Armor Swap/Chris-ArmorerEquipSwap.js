let item = args[0].item;
let actor = args[0].actor;
let effect;
let doLateUpdate = false;
async function lateUpdate () {
    await warpgate.wait(2000);
    let fieldUses = await actor.getFlag('world', 'feature.defensiveField');
    if (!fieldUses) fieldUses = actor.system.attributes.prof;
    let fieldItem = actor.items.getName('Guardian Armor: Defensive Field');
    if (fieldItem) await fieldItem.update({
        'system.uses.value': fieldUses,
        'system.uses.max': actor.system.attributes.prof
    });
}
switch (item.name) {
    case 'Arcane Armor: Guardian Model':
        effect = actor.effects.find(eff => eff.label === 'Arcane Armor: Infiltrator Model');
        doLateUpdate = true;
        break;
    case 'Arcane Armor: Infiltrator Model':
        effect = actor.effects.find(eff => eff.label === 'Arcane Armor: Guardian Model');
        let defensiveFieldItem = actor.items.getName('Guardian Armor: Defensive Field');
        if (defensiveFieldItem) actor.setFlag('world', 'feature.defensiveField', defensiveFieldItem.system.uses.value);
        break;
}
if (effect) effect.delete();
if (doLateUpdate) lateUpdate();