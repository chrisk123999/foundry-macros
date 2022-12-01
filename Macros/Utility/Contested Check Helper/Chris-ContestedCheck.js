let actor1 = args[0];
let actor2 = args[1];
let skill1 = args[2];
let skill2 = args[3];
let roll1 = await actor1.rollAbilityTest(skill1);
let roll2 = await actor2.rollAbilityTest(skill2);
if (roll1.total > roll2.total) {
    return true;
} else {
    return false;
}