if (canvas.scene.grid.units != 'ft') return;
if (this.hook.animate === false) return;
let cellDistance;
if (canvas.scene.grid.type != 0) {
	let through = this.hook.templatemacro.through.find(tmp => tmp.templateId === template.id);
	if (!through) return;
	cellDistance = through.cells.length;
} else {
	let token = canvas.tokens.get(this.tokenId);
	let currentTokenCenter = {
		x: this.coords.current.x + (token.w / 2),
		y: this.coords.current.y + (token.w / 2)
	};
	let previousTokenCenter = {
		x: this.coords.previous.x + (token.w / 2),
		y: this.coords.previous.y + (token.w / 2)
	};
	let intersectionPoint = quadraticIntersection(previousTokenCenter, currentTokenCenter, template.object.center, template.object.shape.radius, epsilon=0);
	if (intersectionPoint.length === 0) return;
	let ray = new Ray(intersectionPoint[0], currentTokenCenter);
	cellDistance = (Math.ceil(ray.distance / canvas.scene.grid.size));
}
let scale = Math.ceil(canvas.scene.grid.distance / 5);
let distance = cellDistance * scale;
if (distance <= 0) return;
for (let i = 0; i < distance; i++) {
	let damageDice = '2d4[piercing]';
	let diceRoll = await new Roll(damageDice).roll({async: true});
	let diceTotal = diceRoll.total;
	diceRoll.toMessage({
		rollMode: 'roll',
		speaker: {alias: name},
		flavor: 'Spike Growth Damage'
	});
	let token = canvas.tokens.get(this.tokenId);
	await MidiQOL.applyTokenDamage(
		[
			{
				damage: diceTotal,
				type: 'piercing'
			}
		],
		diceTotal,
		new Set([token]),
		null,
		null
	);
}