module.exports = async function (arguments) {
	if (arguments[0] === undefined) arguments.push("help");

	tired.loadGlobal("html");
	await tired.private.load("html");
	await tired.private.init("html");

	try {
		tired.working.config = await tired.working.require("config.js");
	} catch (err) {
		tired.working.config = {};
	}

	switch (arguments[0]) {
		case "help":
			tired.root.require('commands/html/help.js')();
			break;
		case "test":
			tired.root.require('commands/html/test.js');
			break;
		// htmldev {PORT}
		case "audit":
			const AUDIT_PORT_NUMBER = parseInt(arguments[1]);

			// Run the HTTP server with the valid port
			if (Number.isInteger(AUDIT_PORT_NUMBER)) tired.root.require('commands/html/audit.js')(AUDIT_PORT_NUMBER);
			break;
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
			await tired.root.require('commands/html/runbuild.js')();
			break;
		default: // host
			const PORT_NUMBER = parseInt(arguments[0]);

			// Run the HTTP server with the valid port
			if (Number.isInteger(PORT_NUMBER)) tired.root.require('commands/html/host.js')(PORT_NUMBER);
			break;
	}
}