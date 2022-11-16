let combatTurn = game.combat.round + '-' + game.combat.turn;
let templateid = effect.flags.world.spell.cloudkill.templateid;
token.document.setFlag('world', `spell.cloudkill.${templateid}.turn`, combatTurn);