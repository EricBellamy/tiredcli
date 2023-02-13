const path = require('path');
const fs = require('fs-extra');

// root - the root folder of the tiredcli
// working - the working directory we're calling from

global.tired = {
	location: {},
	files: {},
	log: {},
	help: {}
};
tired.loadGlobal = function (name) {
	if (name != "all") return require(`./${name}/${name}.js`);
}

// Location info
tired.location.folder = ".tired";
tired.location.root = path.join(__dirname + "/../../..");
tired.location.working = process.cwd();

// File Functions
tired.files.read = function (filename) { return fs.readFileSync(`${tired.location.folder}/${filename}`); }
tired.files.write = function (filename, dataString) { return fs.writeFileSync(`${tired.location.folder}/${filename}`, dataString); }
tired.files.ensureDir = function (filename) { return fs.ensureDirSync(`${tired.location.folder}/${filename}`); }
tired.files.readJson = function (filename, throwError = true) { tired.help.readJson(tired.location.folder + filename, throwError); }
tired.files.saveJson = function (filename, data) { return fs.writeFileSync(`${tired.location.folder}/${filename}`, JSON.stringify(data)); }
tired.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) { return tired.help.readDirFiles(tired.location.folder + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH); }

// Initialize the globals for our root & working directories
tired.root = require('./root.js');
tired.working = require('./working.js');

// Caching
tired.cache = tired.root.require('lib/public/module/crypto/cache.js');

// Logging
tired.log.color = tired.root.require('lib/public/module/log/color.js');

// Helpers
tired.help.debounce = tired.root.require('lib/public/module/time/debounce.js');
tired.help.clone = function (data) { return JSON.parse(JSON.stringify(data)); };

tired.help.readDirs = tired.root.require('lib/public/module/files/readDirs.js');
tired.help.readDirFiles = tired.root.require('lib/public/module/files/readDirFiles.js');
tired.help.readJson = tired.root.require('lib/public/module/files/readDirFiles.js');
tired.help.getFileType = tired.root.require('lib/public/module/files/getFileType.js');
tired.help.modifyName = tired.root.require('lib/public/module/files/modifyName.js');
tired.help.caller = tired.root.require('lib/public/module/log/caller.js');
tired.help.filesize = function (filename) { return fs.statSync(filename).size; };
tired.help.sleep = ms => new Promise(r => setTimeout(r, ms));
tired.help.isObject = function (variable) { return typeof variable === 'object' && !Array.isArray(variable) && variable !== null; };
tired.help.getFolderPath = function(filename){ return filename.substring(0, filename.lastIndexOf("/")); };

tired.help.validateFileRead = async function (filename) {
	const currentSize = tired.help.filesize(filename);
	const initialSize = tired.cache.data.get('filesize', filename);

	// The file was changed as it was being read
	if (currentSize != initialSize) {
		await tired.help.sleep(1000);
		return false;
	} else return true;
}

tired.help.link = {
	needsUpdating: tired.root.require('lib/public/module/files/link/needsUpdating.js'),
	read: tired.root.require('lib/public/module/files/link/readFile.js'),
	write: tired.root.require('lib/public/module/files/link/writeFile.js'),
}

// Private libraries
tired.private = tired.root.require('lib/public/module/private/loader.js');
tired.private.env = function(key, value){
	if (value) process.env[key] = value;
	else {
		const envValue = process.env[key];
		return envValue != undefined ? process.env[key] : false;
	}
}
tired.private.env.clear = function(key){
	delete process.env[key];
}