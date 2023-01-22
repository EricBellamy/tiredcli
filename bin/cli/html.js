module.exports = async function (arguments) {
	if (arguments[0] === undefined) arguments.push("help");

	global.tired.loadGlobal("html");

	switch (arguments[0]) {
		case "help":
			global.tired.root.require('commands/html/help.js')();
			break;
		// htmldev {PORT}
		case "init":

			break;
		case "list":

			break;
		case "rm":

			break;
		case "update":

			break;
		case "deploy":

			break;
		case "backup":

			break;
		case "build":

			break;
		default: // host
			const PORT_NUMBER = parseInt(arguments[0]);

			// Run the HTTP server with the valid port
			if (Number.isInteger(PORT_NUMBER)) global.tired.root.require('commands/html/host.js')(PORT_NUMBER);
			break;
	}
}