let tokensInTemplate = await game.modules.get('templatemacro').api.findContained(template);
console.log(tokensInTemplate);
let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens || [];
console.log(touchedTokens);
for (let i = 0; tokensInTemplate.length > i; i++) {
	if (!touchedTokens.includes(tokensInTemplate[i])) touchedTokens.push(tokensInTemplate[i]);
}
await template.setFlag('world', 'spell.cloudkill', {touchedTokens});
game.macros.getName('Chris-CloudkillEffect').execute(touchedTokens);