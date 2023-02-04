const colors = require('colors/safe');

// Allows for easier color logging to the console
const validColors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
module.exports = function (...args) {
	const logArray = [];
	for (const arg of args) {
		if (validColors.indexOf(arg[0]) != -1) logArray.push(colors[arg[0]](arg[1]));
	}
	console.log(logArray.join(''));
	return args[args.length - 1];
}
module.exports.batch = function(items){
	for(const item of items){
		module.exports(...item);
	}
}