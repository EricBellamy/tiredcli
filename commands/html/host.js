const fs = require('fs-extra');
const ngrok = require('ngrok');

const build = require('./build.js');

tired.HOST_CONFIG = {
	server: { status: true },
	audit: { status: true },
	ngrok: { status: false },
}
module.exports = async function (PORT_NUMBER) {
	tired.html.dist.ensureEmptyDist();

	// Initialize watcher, runs build once on start
	tired.root.require('lib/public/html/build/watch.js')(async function (changedFiles, callback) {
		const buildResponse = await build.files(changedFiles);

		callback();

		console.log();

		// If we don't need a server
		if (tired.HOST_CONFIG.server.status === false) return process.exit();
		else if (tired.HOST_CONFIG.server.active === true) return;


		// We're about to host the server
		tired.HOST_CONFIG.server.active = true;

		// Host HTTP light-server (Hot reload) & NGROK (public tunnel)
		if (tired.HOST_CONFIG.ngrok.status) {
			const ngrokConfig = {
				addr: `https://0.0.0.0:${PORT_NUMBER}`,
				region: 'us'
			}
			if (tired.HOST_CONFIG.ngrok.subdomain != undefined && tired.HOST_CONFIG.ngrok.authtoken != undefined) {
				ngrokConfig.subdomain = tired.HOST_CONFIG.ngrok.subdomain;
				ngrokConfig.authtoken = tired.HOST_CONFIG.ngrok.authtoken;
			}
			tired.HOST_CONFIG.ngrok.url = await ngrok.connect(ngrokConfig);
		}

		// tired.root.require('lib/public/html/host/auditserver.js')(PORT_NUMBER + 2);
		tired.root.require('lib/public/html/host/lightserver.js')(PORT_NUMBER);
	});
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });