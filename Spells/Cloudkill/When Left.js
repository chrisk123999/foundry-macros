console.log('Processing Left');
let effect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
if (!effect) return;
let templateid = effect.flags.world.spell.cloudkill.templateid;
if (templateid === template.id) effect.delete();