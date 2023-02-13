const build = tired.root.require('commands/html/build.js');
module.exports = async function () {
	// Do a dev build first with a nextProcessing flag so more intensive processes knows to join in (puppeteer)
	tired.html.dist.ensureEmptyDist();
	tired.private.env("processing", "dev");
	tired.private.env("nextProcessing", "prod");
	await build.files();

	// Change the environment to prod and rebuild
	build.reset();
	tired.html.dist.ensureEmptyDist();
	tired.private.env("processing", "prod");
	tired.private.env.clear("nextProcessing");
	await build.files();
}