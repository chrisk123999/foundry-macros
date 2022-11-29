Hooks.on('dnd5e.restCompleted', (actor, data) => {
    if (!data.longRest) return;
    let item = actor.items.getName('Guardian Armor: Defensive Field');
    if (!item) return;
    actor.setFlag('world', 'feature.defensiveField', actor.system.attributes.prof);
});