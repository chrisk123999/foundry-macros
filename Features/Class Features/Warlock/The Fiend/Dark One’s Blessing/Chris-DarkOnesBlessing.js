if (this.hitTargets.length === 0) return;
let doHealing = false;
for (let i of this.damageList) {
    if (i.oldHP != 0 && i.newHP === 0) {
        doHealing = true;
        break;
    }
}
if (!doHealing) return;
let feature = this.actor.items.getName('Dark One\'s Blessing');
if (!feature) return;
await feature.roll();