// light-server -s dist -w dist/*.html
const LightServer = require('light-server');

module.exports = async function (PORT_NUMBER) {
	if (PORT_NUMBER) {
		const server = new LightServer({
			port: PORT_NUMBER,
			// interval: 500,
			// delay: 0,
			// watchexps: ['.tired/html/dist/*.html', '.tired/html/dist/**/*.html'],
			watchexps: [],
			bind: undefined,
			proxypaths: ['/'],
			serve: '.tired/html/dist'
		});
		server.start();
		tired.lightserver_port = PORT_NUMBER;
	}
}