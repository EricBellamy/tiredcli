const fs = require('fs-extra');
const build = require('./build.js');

module.exports = async function (PORT_NUMBER, EMPTY = true) {
	if (EMPTY) fs.emptyDirSync('.tired/html');
	fs.ensureDirSync('.tired/html/dist');

	// Initialize watcher, runs build once on start
	global.tired.require('lib/html/build/watch.js')(async function (changedFiles, callback) {
		await build(changedFiles);
		callback();
	});

	// Host HTTP light-server (Hot reload)
	global.tired.require('lib/html/host/lightserver.js')(PORT_NUMBER);
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });