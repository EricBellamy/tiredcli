const fs = require('fs-extra');

module.exports.require = function (requirePath) { return require(tired.location.root + "/" + requirePath); }

module.exports.files = {};
module.exports.files.readText = async function (filename, retry = false) {
	const contents = fs.readFileSync(`${tired.location.root}/${filename}`, 'utf-8');

	// If the file was modified while being read, try again
	if (retry && !await tired.help.validateFileRead(filename)) return await module.exports.files.readText(filename, false);
	else return contents;
};
module.exports.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles(tired.location.root + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};
module.exports.files.readDirFiles.forType = function (CURRENT_PATH, FILE_TYPE = "", SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles.forType(tired.location.root + "/" + CURRENT_PATH, FILE_TYPE, SEARCH_FOLDERS, RELATIVE_PATH);
};

module.exports.files.readDirs = function (CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH) {
	return tired.help.readDirs(tired.location.root + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};