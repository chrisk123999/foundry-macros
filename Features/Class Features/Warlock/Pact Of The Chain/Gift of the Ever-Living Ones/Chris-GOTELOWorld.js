Hooks.on('midi-qol.preDamageRollComplete', async workflow => {
    if (workflow.targets.size != 1) return;
    let targetToken = workflow.targets.first();
    let targetActor = targetToken.actor;
    let item = targetActor.items.getName('Eldritch Invocations: Gift of the Ever-Living Ones');
    if (!item) return;
    let familiarActorid = targetActor.flags.world?.feature?.gotevo;
    if (!familiarActorid) return;
    let familiarActor = game.actors.get(familiarActorid);
    if (!familiarActor) return;
    let familiarTokens = await familiarActor.getActiveTokens();
    if (familiarTokens.length === 0) return;
    let withinRange = false;
    for (let i = 0; familiarTokens.length > i; i++) {
        let distance = MidiQOL.computeDistance(targetToken, familiarTokens[i]);
        if (distance <= 100) {
            withinRange = true;
            break;
        }
    }
    if (!withinRange) return;
    let oldDamageRoll = workflow.damageRoll;
    let newDamageRoll = '';
    for (let i = 0; oldDamageRoll.terms.length > i; i++) {
        let flavor = oldDamageRoll.terms[i].flavor;
        let isDeterministic = oldDamageRoll.terms[i].isDeterministic;
        if (flavor.toLowerCase() != 'healing' || isDeterministic === true) {
            newDamageRoll += oldDamageRoll.terms[i].formula;
        } else {
            newDamageRoll += '(' + oldDamageRoll.terms[i].number + '*' + oldDamageRoll.terms[i].faces + ')[healing]';
        }
    }
    workflow.damageRoll = await new Roll(newDamageRoll).roll({async: true});
    workflow.damageTotal = workflow.damageRoll.total;
    workflow.damageRollHTML = await workflow.damageRoll.render();
});