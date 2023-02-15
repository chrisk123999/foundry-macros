let chris = {
	'createEffect': async function _createEffect(actor, effectData) {
		if (game.user.isGM) {
			await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
		} else {
			await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
		}
	},
	'getSpellDC': function _getSpellDC(item) {
		let spellDC;
		let scaling = item.system.save.scaling;
		if (scaling === 'spell') {
			spellDC = item.actor.system.attributes.spelldc;
		} else {
			spellDC = item.actor.system.abilities[scaling].dc;
		}
		return spellDC;
	},
	'functionToString': function _functiongToString(input) {
		return `(${input.toString()})()`;
	}
};
let template = canvas.scene.collections.templates.get(this.templateId);
if (!template) return;
let spellLevel = this.castData.castLevel;
let spelldc = chris.getSpellDC(this.item);
let touchedTokens = await game.modules.get('templatemacro').api.findContained(template);
await template.setFlag('world', 'spell.cloudkill', {spellLevel, spelldc, touchedTokens});
await game.macros.getName('Chris-CloudkillEffect').execute(touchedTokens);
async function effectMacro () {
	function getAllowedMoveLocation(casterToken, templateDoc, maxSquares) {
		for (let i = maxSquares; i > 0; i--) {
			let movePixels = i * canvas.grid.size;
			let ray = new Ray(casterToken.center, templateDoc.object.center);
			let newCenter = ray.project((ray.distance + movePixels)/ray.distance);
			let isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: templateDoc.Object});
			if(isAllowedLocation) {
				return newCenter;
			}
		}
		return null;
	}
	let templateId = effect.flags.world?.spell?.cloudkill?.templateId;
	if (!templateId) return;
	let templateDoc = canvas.scene.collections.templates.get(templateId);
	if (!templateDoc) return;
	let newCenter = getAllowedMoveLocation(token, templateDoc, 2);
	if(!newCenter) {
		ui.notifications.info('No room to move cloudkill.');
		return;
	}
	newCenter = canvas.grid.getSnappedPosition(newCenter.x, newCenter.y, 1);
	await templateDoc.update({x: newCenter.x, y: newCenter.y});
}
let effectData = {
	'label': 'Cloudkill - Movement Handler',
	'icon': this.item.img,
	'origin': this.item.uuid,
	'duration': {
		'seconds': 60 * this.item.system.duration.value
	},
	'flags': {
		'effectmacro': {
			'onTurnStart': {
				'script': chris.functionToString(effectMacro)
			}
		},
		'world': {
			'spell': {
				'cloudkill': {
					'templateId': this.templateId
				}
			}
		}
	}
};
await chris.createEffect(this.actor, effectData);