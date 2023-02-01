const fs = require('fs-extra');
const build = require('./build.js');

let startHost = true;
let devExit = false;
module.exports = async function (PORT_NUMBER, EMPTY = true) {
	if (EMPTY) fs.emptyDirSync('.tired/html');
	fs.ensureDirSync('.tired/html/dist');

	// Initialize watcher, runs build once on start
	tired.root.require('lib/html/build/watch.js')(async function (changedFiles, callback) {
		const buildResponse = await build.files(changedFiles);
		callback();

		console.log();

		if (devExit) return process.exit();

		// Host HTTP light-server (Hot reload)
		if (startHost) {
			startHost = false;
			tired.root.require('lib/html/host/lightserver.js')(PORT_NUMBER);
		}
	});
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });