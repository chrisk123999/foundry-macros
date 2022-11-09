let effect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
if (effect) effect.delete()