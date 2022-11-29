if (this.targets.size != 1) return;
if (this.disadvantage === true) return;
let neededTargetUuid = this.actor.flags.world.feature.thundergauntlets;
let targetToken = this.targets.first();
if (!targetToken) return;
if (targetToken.id === neededTargetUuid) return;
this.disadvantage = true;