let attackD20 = args[0][0].attackD20;
let actor = args[0][0].actor;
let misfireRange = args[1];
if (attackD20 <= misfireRange) {
    await ChatMessage.create({content: 'Gun has misfired and needs to be fixed!'});
}