// light-server -s dist -w dist/*.html
const LightServer = require('light-server');

module.exports = async function (PORT_NUMBER) {
	if (PORT_NUMBER) {
		const server = new LightServer({
			port: PORT_NUMBER,
			interval: 500,
			delay: 0,
			bind: undefined,
			proxypaths: ['/'],
			watchexps: ['.tired/html/dist/*.html'],
			serve: '.tired/html/dist'
		});
		server.start();
	}
}