const fs = require('fs-extra');
module.exports.files = {
	readDirFiles: function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) {
		return global.tired.help.readDirFiles(global.tired.location.working + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH);
	},
	readText: function(filename){
		return fs.readFileSync(`${global.tired.location.working}/${filename}`, 'utf-8');
	}
}