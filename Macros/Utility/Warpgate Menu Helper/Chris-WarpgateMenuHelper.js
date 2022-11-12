if (!args) return;
let title = args[0];
let buttons = args[1].map(([label,value]) => ({label,value}));
let menuReturn = await warpgate.buttonDialog({
    buttons,
    title,
}, 'column');
return menuReturn;