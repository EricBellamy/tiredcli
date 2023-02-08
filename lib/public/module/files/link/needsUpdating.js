const fs = require('fs-extra');
const links = tired.root.require('lib/public/html/build/process/includes/links.js');

function setCache(includeFilePath, stats) {
	tired.cache.data.set('links/needsUpdating.js', includeFilePath, stats.mtimeMs);
	return true;
}

module.exports = function (FILE_PATH) {
	const includeFilePath = `${tired.location.working}/${FILE_PATH}`;
	const distFilePath = `${process.cwd()}/${tired.location.folder}/${tired.html.folder}/dist/${FILE_PATH}`;

	let stats = fs.statSync(includeFilePath);
	const exists = fs.existsSync(distFilePath);
	if (!exists) {
		setCache(includeFilePath, stats);
		return true; // If the exported file doesn't exist
	}

	// If the cached
	if (tired.cache.data.has('links/needsUpdating.js', includeFilePath)) {
		const cachedMTimeMs = tired.cache.data.get('links/needsUpdating.js', includeFilePath);

		// If the times don't match the file has changed
		if (cachedMTimeMs != stats.mtimeMs) {
			return setCache(includeFilePath, stats);
		} else return false;

	} else { // No cached data somehow
		return setCache(includeFilePath, stats);
	}
};

module.exports.absolute = function (ABSOLUTE_PATH, EXPORT_PATH) {
	let stats = fs.statSync(ABSOLUTE_PATH);
	const exists = fs.existsSync(EXPORT_PATH);

	if (!exists) return setCache(ABSOLUTE_PATH, stats);

	// If the cached
	if (tired.cache.data.has('links/needsUpdating.js', ABSOLUTE_PATH)) {
		const cachedMTimeMs = tired.cache.data.get('links/needsUpdating.js', ABSOLUTE_PATH);

		// If the times don't match the file has changed
		if (cachedMTimeMs != stats.mtimeMs) return setCache(ABSOLUTE_PATH, stats);
		else return false;

		// No cached data somehow
	} else return setCache(ABSOLUTE_PATH, stats);
};