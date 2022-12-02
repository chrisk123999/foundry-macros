if (args[0].hitTargets.length != 1) return;
game.dfreds.effectInterface.addEffect({'effectName': 'Grappled', 'uuid': args[0].hitTargets[0].actor.uuid});