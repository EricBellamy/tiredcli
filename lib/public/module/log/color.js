const colors = require('colors/safe');

// Keeps track of if something has been logged between the stops
const stops = {};
function updateStop(key, value = false) {
	stops[key] = value;
}

// Allows for easier color logging to the console
const validColors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
module.exports = function (key, ...args) {
	if (stops[key] === false) console.log(); // Add a new line if this is the first log for this group
	updateStop(key, true);

	const logArray = [];
	for (let a = 0; a < args.length; a++) {
		let arg = args[a];
		if (a === 0) arg[1] = `[${key}] ${arg[1]}`;

		if (validColors.indexOf(arg[0]) != -1) logArray.push(colors[arg[0]](arg[1]));
	}
	console.log(logArray.join(''));
	return args[args.length - 1];
}
module.exports.batch = function (key, items) {
	updateStop(key, true);

	for (const item of items) {
		module.exports(...item);
	}
}

module.exports.blank = function () { console.log(); };

module.exports.start = function (key) {
	updateStop(key, false);
}
// Adds a new line if we've logged anything between the stops
module.exports.stop = function (key) {
	// if(stops[key] === true) console.log();
	updateStop(key, false);
}