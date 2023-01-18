module.exports = async function (arguments) {
	if (arguments[0] === undefined) arguments.push("help");
	console.log(arguments);

	switch (arguments[0]) {
		case "help":
			global.tiredRequire('commands/html/help.js')();
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
		default: // host
			
			break;
	}
}