let mod = this.item.flags.world?.item?.ross?.mod;
if (!mod) mod = '';
let updatedRoll = await new Roll('1d20' + mod).evaluate({async: true});
this.setAttackRoll(updatedRoll);