// light-server -s dist -w dist/*.html
const LightServer = require('light-server');

function hostServer(port, reload = false, watchexps = [], http2 = false) {
	const serverConfig = {
		port: port,
		watchexps: watchexps,
		proxypaths: ['/'],
		serve: '.tired/html/dist'
	}
	if (reload === false) {
		serverConfig.noReload = true;
		serverConfig.quiet = false;
	}

	if (http2) serverConfig.http2 = true;

	const server = new LightServer(serverConfig);
	server.start();
}

module.exports = async function (PORT_NUMBER) {
	if (PORT_NUMBER) {
		if (tired.HOST_CONFIG.audit.status) hostServer(PORT_NUMBER + 1, false, [], false); // lighthouse audit server
		hostServer(PORT_NUMBER, true, [], tired.HOST_CONFIG.ngrok.url != undefined); // dev server

		tired.HOST_CONFIG.server.port = PORT_NUMBER;
		tired.HOST_CONFIG.server.local_url = `http://localhost:${PORT_NUMBER}`;

		// If we have ngrok, set the server url to it
		if (tired.HOST_CONFIG.ngrok.url != undefined) tired.HOST_CONFIG.server.url = tired.HOST_CONFIG.ngrok.url;
		else tired.HOST_CONFIG.server.url = tired.HOST_CONFIG.server.local_url;

		tired.log.color.start('lightserver.js');
		if (tired.HOST_CONFIG.audit.status) tired.log.color('lightserver.js', ['cyan', `audit server: http://localhost:${PORT_NUMBER + 1}` + '\n']);
		tired.log.color('lightserver.js', ['cyan', tired.HOST_CONFIG.server.url + '\n']);
		tired.log.color.stop('lightserver.js');
	}
}