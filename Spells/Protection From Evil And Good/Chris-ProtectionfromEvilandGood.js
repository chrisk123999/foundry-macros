Hooks.on('midi-qol.preAttackRoll', workflow => {
    if (workflow.targets.size != 1) return;
    if (workflow.disadvantage === true) return;
    let target = workflow.targets.first();
    let targetEffect = target.actor.effects.find(eff => eff.label === 'Protection from Evil and Good');
    if (!targetEffect) return;
    let actorRace;
    if (target.actor.system.type === 'npc') {
        actorRace = workflow.actor.system.details?.type?.value;
    } else if (target.actor.system.type === 'character') {
        actorRace = workflow.actor.system.details.race;
    }
    if (!actorRace) return;
    let races = ['aberration', 'celestial', 'elemental', 'fey', 'fiend', 'undead'];
    if (races.includes(actorRace)) workflow.disadvantage = true;
});