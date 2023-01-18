const commands = [
	["html {PORT}", "hosts an HTTP server & build process that watches for changes"],
	["html init", "registers this folder for automatic updates"],
	["html list", "lists the active HTML repos"],
	["html rm {PATH}", "removes the folder from automatic updates"],
	["html update", "updates helper code & deploys all initialized folders"],
	["html deploy", "deploys the current folder"],
];

// Get the max length of command
let maxLength = 0;
for (const command of commands) if (maxLength < command[0].length) maxLength = command[0].length;

module.exports = function () {
	console.log("html <command>\n")
	console.log("Usage:\n");

	// Pad command strings to same length & print
	for (const command of commands) {
		for (let a = command[0].length; a < maxLength + 2; a++) command[0] += " ";
		console.log(command[0] + command[1]);
	}
}