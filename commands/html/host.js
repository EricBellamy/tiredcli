const ngrok = require('ngrok');

const build = require('./build.js');

tired.HOST_CONFIG = {
	server: { status: true },
	audit: { status: true },
	ngrok: { status: false },
}

async function launchServers(PORT_NUMBER) {
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
	tired.root.require('lib/public/html/host/lightserver.js')(PORT_NUMBER, true, tired.HOST_CONFIG.ngrok.url != undefined);
	if (tired.HOST_CONFIG.audit.status) tired.root.require('lib/public/html/host/lightserver.js')(PORT_NUMBER + 1, false, false);

	// Set the environment variables
	tired.HOST_CONFIG.server.port = PORT_NUMBER;
	tired.HOST_CONFIG.server.local_url = `http://localhost:${PORT_NUMBER}`;

	// If we have ngrok, set the server url to it
	if (tired.HOST_CONFIG.ngrok.url != undefined) tired.HOST_CONFIG.server.url = tired.HOST_CONFIG.ngrok.url;
	else tired.HOST_CONFIG.server.url = tired.HOST_CONFIG.server.local_url;

	// Log the server urls
	tired.log.color.start('lightserver.js');
	if (tired.HOST_CONFIG.audit.status) tired.log.color('lightserver.js', ['cyan', `audit server: http://localhost:${PORT_NUMBER + 1}` + '\n']);
	tired.log.color('lightserver.js', ['cyan', tired.HOST_CONFIG.server.url + '\n']);
	tired.log.color.stop('lightserver.js');
}

module.exports = async function (PORT_NUMBER) {
	tired.html.dist.ensureEmptyDist();

	// Initialize watcher, runs build once on start
	tired.root.require('lib/public/html/build/watch.js')(async function (changedFiles, callback) {
		build.resetCache();
		const buildResponse = await build.files(changedFiles);

		callback();

		console.log();

		// If we don't need a server
		if (tired.HOST_CONFIG.server.status === false) return process.exit();
		else if (tired.HOST_CONFIG.server.active === true) return;

		// Launch the servers once
		await launchServers(PORT_NUMBER);
	});
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });