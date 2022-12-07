let dryRun = true;

for (let a of game.actors) {
    if (a.system.attributes.ac.calc != 'flat') continue;
    console.log('Updating AC calculation for: ' + a.name);
    if (dryRun) continue;
    await a.update({
        'system.attributes.ac.calc': 'natural',
    });
    await warpgate.wait(100);
}
console.log('AC migration complete.');