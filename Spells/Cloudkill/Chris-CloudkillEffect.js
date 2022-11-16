let tokenids = args[0];
for (let i = 0; tokenids.length > i; i++) {
    console.log('Checking Token ID: ' + tokenids[i]);
    let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
    if (!tokenDoc) continue;
    let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
    console.log(tokenInTemplates);
    let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
    let createEffect = false;
    let deleteEffect = false;
    let inCloudkill = false;
    let spellLevel = -100;
    let spelldc = -100;
    let oldSpellLevel = effect?.flags?.world?.spell?.cloudkill?.spellLevel;
    let oldSpelldc = effect?.flags?.world?.spell?.cloudkill?.spelldc;
    let templateid = effect?.flags?.world?.spell?.cloudkill?.templateid;
    console.log('Current Spell Level: ' + spellLevel);
    console.log('Current Spell DC: ' + spelldc);
    console.log('Current Spell Template ID: ' + templateid);
    for (let j = 0; tokenInTemplates.length > j; j++) {
        console.log('Checking Template ID: ' + tokenInTemplates[j]);
        let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
        if (!testTemplate) continue;
        console.log(testTemplate);
        let cloudkill = testTemplate.flags.world?.spell?.cloudkill;
        if (!cloudkill) continue;
        inCloudkill = true;
        let testSpellLevel = cloudkill.spellLevel;
        console.log('Checking Spell Level:' + testSpellLevel);
        let testSpelldc = cloudkill.spelldc;
        console.log('Checking Spell DC:' + testSpelldc);
        if (testSpellLevel > spellLevel) {
            spellLevel = testSpellLevel;
            templateid = tokenInTemplates[j];
        }
        if (testSpelldc > spelldc) {
            spelldc = testSpelldc;
            templateid = tokenInTemplates[j];
        }
    }
    if (!inCloudkill) {
        deleteEffect = true;
    } else {
        if (oldSpellLevel != spellLevel || oldSpelldc != spelldc) {
            createEffect = true;
            deleteEffect = true;
        }
    }
    if (deleteEffect && effect) {
        console.log('Deleting old Cloudkill effect');
		try {
			await effect.delete();
		} catch {
			console.log('Effect already gone.');
		}
    }
    if (createEffect && inCloudkill && (oldSpellLevel != spellLevel || oldSpelldc != spelldc)) {
        console.log('Creating new Cloudkill effect');
        let damageRoll = spellLevel + 'd8';
        let templateDoc = canvas.scene.collections.templates.get(templateid);
        console.log(templateDoc);
        let origin = templateDoc.flags?.dnd5e?.origin;
        console.log(origin);
        let effectData = {
			'label': 'Cloudkill',
			'icon': 'icons/magic/air/fog-gas-smoke-swirling-green.webp',
			'changes': [
				{
				'key': 'flags.midi-qol.OverTime',
				'mode': 5,
				'value': 'turn=start, rollType=save, saveAbility= con, saveDamage= halfdamage, saveRemove= false, saveMagic=true, damageType= poison, damageRoll= ' + damageRoll + ', saveDC = ' + spelldc,
				'priority': 20
				}
			],
			'origin': origin,
			'duration': {'seconds': 86400},
			'flags': {
		        'effectmacro': {
			        'onTurnStart': {
				        'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.cloudkill.templateid;\ntoken.document.setFlag('world', `spell.cloudkill.${templateid}.turn`, combatTurn);"
			        }
		        },
		        'world': {
	                'spell': {
			            'cloudkill': {
				            'spellLevel': spellLevel,
				            'spelldc': spelldc,
				            'templateid': templateDoc.id
			            }
		            }
		        }
	        }
		};
		await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }
}