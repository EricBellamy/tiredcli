const fs = require('fs-extra');
const lockfile = require('proper-lockfile');

module.exports.require = function (requirePath) { return require(tired.location.working + "/" + requirePath); }
module.exports.files = {
	readText: async function (filename, retry = false) {
		const contents = fs.readFileSync(`${tired.location.working}/${filename}`, 'utf-8');

		// If the file was modified while being read, try again
		if (retry && !await tired.help.validateFileRead(filename)) return await module.exports.files.readText(filename, !retry);
		else return contents;
	},
	readLinkFile: async function (filename, attributes) {
		return await tired.help.readLinkFile(`${tired.location.working}/${filename}`, attributes);
	},
	modified: function (filename) {
		return fs.statSync(`${tired.location.working}/${filename}`).mtimeMs;
	}
};
module.exports.files.readLinkFile.processFile = async function (contents, filetype, attributes = {}, minify = true) {
	return await tired.help.readLinkFile.processFile(contents, filetype, attributes, minify);
};
module.exports.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles(tired.location.working + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};
module.exports.files.readDirFiles.forType = function (CURRENT_PATH, FILE_TYPE = "", SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles.forType(tired.location.working + "/" + CURRENT_PATH, FILE_TYPE, SEARCH_FOLDERS, RELATIVE_PATH);
};