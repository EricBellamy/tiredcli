// light-server -s dist -w dist/*.html
const LightServer = require('light-server');

module.exports = async function (PORT_NUMBER) {
	if (PORT_NUMBER) {
		const serverConfig = {
			port: PORT_NUMBER,
			watchexps: [],
			bind: undefined,
			proxypaths: ['/'],
			serve: '.tired/html/dist'
		}

		if (tired.HOST_CONFIG.ngrok.url != undefined) serverConfig.http2 = true;

		const server = new LightServer(serverConfig);
		server.start();

		tired.HOST_CONFIG.server.port = PORT_NUMBER;
		tired.HOST_CONFIG.server.local_url = `http://localhost:${PORT_NUMBER}`;

		// If we have ngrok, set the server url to it
		if (tired.HOST_CONFIG.ngrok.url != undefined) tired.HOST_CONFIG.server.url = tired.HOST_CONFIG.ngrok.url;
		else tired.HOST_CONFIG.server.url = tired.HOST_CONFIG.server.local_url;

		tired.log.color.start('lightserver.js');
		tired.log.color('lightserver.js', ['cyan', tired.HOST_CONFIG.server.url + '\n']);
		tired.log.color.stop('lightserver.js');
	}
}