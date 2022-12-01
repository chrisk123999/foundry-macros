let tokenID = args[0];
let spellLevel = args[1];
let damageType = args[2];
let spellDC = args[3];
let targetToken = canvas.scene.tokens.get(tokenID);
if (!targetToken) return;
let targetActor = targetToken.actor;
let diceNumber = spellLevel + 1;
let dragonBreath = targetActor.items.getName('Dragon Breath');
if (!dragonBreath) return;
await dragonBreath.update(
    {
        'system.damage.parts': [
            [
                diceNumber + 'd6[' + damageType + ']',
                damageType
            ]
        ],
        'system.save.dc': spellDC
    }
);