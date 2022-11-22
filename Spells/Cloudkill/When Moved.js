let tokensInTemplate = await game.modules.get('templatemacro').api.findContained(template);
let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens || [];
for (let i = 0; tokensInTemplate.length > i; i++) {
	if (!touchedTokens.includes(tokensInTemplate[i])) touchedTokens.push(tokensInTemplate[i]);
}
await template.setFlag('world', 'spell.cloudkill', {touchedTokens});
game.macros.getName('Chris-CloudkillEffect').execute(touchedTokens);