let effectData = {
	"label": "Condition Advantage",
	"icon": "icons/magic/time/arrows-circling-green.webp",
	"duration": {
		"turns": 1
	},
	"changes": [
		{
			"key": "flags.midi-qol.magicResistance.all",
			"value": "1",
			"mode": 2,
			"priority": 20
		}
	]
};
let cleanUpList = [];
async function addEffect (actorUuid) {
    await MidiQOL.socket().executeAsGM("createEffects", {'actorUuid': actorUuid, 'effects': [effectData]});
}

Hooks.on('midi-qol.preItemRoll', async workflow => {
    if (workflow.targets.size === 0) return;
    if (workflow.item.system.save.dc === null) return;
    if (workflow.item.effects.size === 0) return;
    let itemConditions = new Set();
    workflow.item.effects.forEach(effect => {
        effect.changes.forEach(element => {
            if (element.key === 'macro.CE') itemConditions.add(element.value.toLowerCase());
        });
    });
//    console.log(itemConditions);
    if (itemConditions.size === 0) return;
    workflow.targets.forEach(token5e => {
//        console.log(token5e);
        itemConditions.forEach(condition => {
            if (token5e.document.actor.flags.world?.CR?.[condition] === 1) {
//                console.log('Adding advantage.');
                addEffect(token5e.document.actor.uuid);
                cleanUpList.push(token5e.document.actor);
            }
        });
    });
});
Hooks.on('midi-qol.RollComplete', async workflow => {
    for (let i=0; cleanUpList.length > i; i++) {
        let effect = cleanUpList[i].effects.find(eff => eff.label === 'Condition Advantage');
        if (!effect) continue;
        MidiQOL.socket().executeAsGM("removeEffects", {'actorUuid': cleanUpList[i].uuid, effects: [effect.id]});
    }
    cleanUpList = [];
});