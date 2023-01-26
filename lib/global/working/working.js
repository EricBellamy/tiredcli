const fs = require('fs-extra');
module.exports.require = function (requirePath) { return require(global.tired.location.working + "/" + requirePath); }
module.exports.files = {
	readText: function(filename){
		return fs.readFileSync(`${global.tired.location.working}/${filename}`, 'utf-8');
	}
};
module.exports.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return global.tired.help.readDirFiles.forType(global.tired.location.working + "/" + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
};
module.exports.files.readDirFiles.forType = function (CURRENT_PATH, FILE_TYPE = "", SEARCH_FOLDERS = true, RELATIVE_PATH) {
	return global.tired.help.readDirFiles.forType(global.tired.location.working + "/" + CURRENT_PATH, FILE_TYPE, SEARCH_FOLDERS, RELATIVE_PATH);
};