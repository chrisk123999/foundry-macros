let roll = await new Roll('1d6').roll({async: true});
roll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Recharge'
});
if (roll.total === 6) await item.update({'system.uses.value': 1});