let chris = {
	'removeCondition': async function _removeCondition(actor, name) {
		await game.dfreds.effectInterface.removeEffect(
			{
				'effectName': name,
				'uuid': actor.uuid
			}
		);
	}
};
await chris.removeCondition(actor, 'Concentrating');