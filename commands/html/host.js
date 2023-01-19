const fs = require('fs-extra');

module.exports = async function (PORT_NUMBER, EMPTY = true) {
	if (EMPTY) fs.emptyDirSync('.tired/html');
	fs.ensureDirSync('.tired/html/dist');

	// Host HTTP light-server (Hot reload)
	global.tiredRequire('lib/html/host/lightserver.js')(PORT_NUMBER);
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });