const fs = require('fs-extra');

module.exports.require = function (requirePath) { return require(tired.location.working + "/" + requirePath); }
module.exports.files = {
	readText: async function (filename, retry = false) {
		const contents = fs.readFileSync(`${tired.location.working}/${filename}`, 'utf-8');

		// If the file was modified while being read, try again
		if (retry && !await tired.help.validateFileRead(filename)) return await module.exports.files.readText(filename, !retry);
		else return contents;
	},
	readLinkFile: async function (filename, attributes) {
		return await tired.help.link.read(`${tired.location.working}/${filename}`, attributes);
	},
	modified: function (filename) {
		try {
			return fs.statSync(`${tired.location.working}/${filename}`).mtimeMs;
		} catch(err){
			return false;
		}
	},
	stat: function (filename) {
		try {
			return fs.statSync(`${tired.location.working}/${filename}`);
		} catch(err){
			return false;
		}
	}
};
module.exports.files.readLinkFile.processFile = async function (contents, filetype, attributes = {}, minify = true) {
	return await tired.help.link.read.processFile(contents, filetype, attributes, minify);
};
module.exports.files.readDirs = function (CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH) {
	return tired.help.readDirs(tired.location.working + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};
module.exports.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles(tired.location.working + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};
module.exports.files.readDirFiles.forType = function (CURRENT_PATH, FILE_TYPE = "", SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles.forType(tired.location.working + "/" + CURRENT_PATH, FILE_TYPE, SEARCH_FOLDERS, RELATIVE_PATH);
};