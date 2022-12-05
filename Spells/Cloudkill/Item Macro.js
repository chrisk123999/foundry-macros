let template = canvas.scene.collections.templates.get(args[0].templateId);
if (!template) return;
let spellLevel = args[0].spellLevel;
let spelldc = args[0].actor.system.attributes.spelldc;
let touchedTokens = await game.modules.get('templatemacro').api.findContained(template);
await template.setFlag('world', 'spell.cloudkill', {spellLevel, spelldc, touchedTokens});
game.macros.getName('Chris-CloudkillEffect').execute(touchedTokens);