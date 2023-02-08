const fs = require('fs-extra');
const ngrok = require('ngrok');

const build = require('./build.js');

let startHost = true;
let devExit = false;
tired.HOST_CONFIG = {
	server: { status: true },
	ngrok: { status: false },
}
module.exports = async function (PORT_NUMBER, EMPTY = true) {
	if (EMPTY) fs.emptyDirSync('.tired/html');
	fs.ensureDirSync('.tired/html/dist');

	// Initialize watcher, runs build once on start
	tired.root.require('lib/public/html/build/watch.js')(async function (changedFiles, callback) {
		const buildResponse = await build.files(changedFiles);

		callback();

		console.log();

		// If we don't need a server
		if (tired.HOST_CONFIG.server.status === false) return process.exit();

		// Host HTTP light-server (Hot reload)
		if (startHost) {
			startHost = false;

			if (tired.HOST_CONFIG.ngrok.status) {
				const ngrokConfig = {
					addr: `https://0.0.0.0:${PORT_NUMBER}`,
					region: 'us'
				}
				if(tired.HOST_CONFIG.ngrok.subdomain != undefined && tired.HOST_CONFIG.ngrok.authtoken != undefined){
					ngrokConfig.subdomain = tired.HOST_CONFIG.ngrok.subdomain;
					ngrokConfig.authtoken = tired.HOST_CONFIG.ngrok.authtoken;
				}
				tired.HOST_CONFIG.ngrok.url = await ngrok.connect(ngrokConfig);
			}

			tired.root.require('lib/public/html/host/lightserver.js')(PORT_NUMBER);
		}
	});
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });