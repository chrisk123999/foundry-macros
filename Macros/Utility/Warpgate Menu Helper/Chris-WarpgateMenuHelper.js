if (!args) return;
let menuTitle = args[0];
let menuOptions = args[1];
let buttonData = [];
for (let i = 0; i < menuOptions.length; i++) {
	let menuLabel = menuOptions[i][0];
	let menuValue = menuOptions[i][1];
	let generatedOption = {};
	generatedOption = {
		label: menuLabel,
		value: menuValue
	};
	buttonData.push(generatedOption);
}
let menuReturn = await warpgate.buttonDialog({
	buttons: buttonData,
	title: menuTitle
}, 'column');
return menuReturn;