if (this.hitTargets.size === 0) return;
let effect = this.actor.effects.find(eff => eff.label === 'Acidic Blood');
if (!effect) return;
let originItem = await fromUuid(effect.origin);
let originActor = originItem.actor;
if (!originActor) return;
if (originActor.id != this.hitTargets.first().actor.id) return;
let damageType = this.defaultDamageType;
let validTypes = ['bludgeoning', 'piercing', 'slashing'];
if (!validTypes.includes(damageType)) return;
let options = {
	'showFullCard': false,
	'createWorkflow': true,
	'targetUuids': [this.token.document.uuid],
	'configureDialog': false,
	'versatile': false,
	'consumeResource': false,
	'consumeSlot': false,
};
let acidWorkflow = await MidiQOL.completeItemRoll(originItem, options);
if (acidWorkflow.failedSaves.size != 1) return;
let effectData = {
	'label': 'Acidic Blood',
	'icon': acidWorkflow.item.img,
	'duration': {
		'rounds': 1
	},
	'origin': acidWorkflow.item.uuid,
	'flags': {
		'dae': {
			'transfer': false,
			'specialDuration': [
				'turnStartSource'
			],
			'stackable': 'multi',
			'macroRepeat': 'none'
		},
		'effectmacro': {
			'onDelete': {
				'script': "let roll = await new Roll('2d6[acid]').roll({async: true});\nroll.toMessage({\n\trollMode: 'roll',\n\tspeaker: {alias: name},\n\tflavor: effect.label\n});\nawait MidiQOL.applyTokenDamage(\n\t[\n\t\t{\n\t\t\tdamage: roll.total,\n\t\t\ttype: 'acid'\n\t\t}\n\t],\n\troll.total,\n\tnew Set([token]),\n\tnull,\n\tnull\n);"
			}
		}
	}
};
await this.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);