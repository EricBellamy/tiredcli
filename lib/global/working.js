const fs = require('fs-extra');
module.exports.require = function (requirePath) { return require(tired.location.working + "/" + requirePath); }
module.exports.files = {
	readText: function(filename){
		return fs.readFileSync(`${tired.location.working}/${filename}`, 'utf-8');
	},
	readLinkFile: async function(filename, attributes){
		return await tired.help.readLinkFile(`${tired.location.working}/${filename}`, attributes);
	}
};
module.exports.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles(tired.location.working + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};
module.exports.files.readDirFiles.forType = function (CURRENT_PATH, FILE_TYPE = "", SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return tired.help.readDirFiles.forType(tired.location.working + "/" + CURRENT_PATH, FILE_TYPE, SEARCH_FOLDERS, RELATIVE_PATH);
};