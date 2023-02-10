let chris = {
	'findEffect': function _findEffect(actor, name) {
		return actor.effects.find(eff => eff.label === name);
	},
	'raceOrType': function _raceOrType(actor) {
		return actor.type === "npc" ? actor.system.details?.type?.value : actor.system.details?.race;
	}
};
if (this.targets.size != 1) return;
if (this.disadvantage) return;
let type = chris.raceOrType(this.actor);
if (type != 'undead') return;
let effect = chris.findEffect(this.actor, 'Chill Touch');
if (!effect) return;
let sourceActor = await fromUuid(effect.origin);
let sourceActorId = sourceActor.actor.id;
if (this.targets.first().actor.id != sourceActorId) return;
this.disadvantage = true;