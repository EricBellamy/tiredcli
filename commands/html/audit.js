module.exports = async function (PORT_NUMBER) {
	tired.root.require('lib/public/html/host/lightserver.js')(PORT_NUMBER, true);

	// Log the server urls
	tired.log.color.start('lightserver.js');
	tired.log.color('lightserver.js', ['cyan', `audit server: http://localhost:${PORT_NUMBER}`]);
	tired.log.color.stop('lightserver.js');
}

// Remove the need for 2x [ ctrl + c ]
process.on('SIGINT', function () { process.exit(); });