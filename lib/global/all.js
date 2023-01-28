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
tired.location.root = path.join(__dirname + "/../..");
tired.location.working = process.cwd();

// File Functions
tired.files.read = function (filename) { return fs.readFileSync(`${tired.location.folder}/${filename}`); }
tired.files.write = function (filename, dataString) { return fs.writeFileSync(`${tired.location.folder}/${filename}`, dataString); }
tired.files.readJson = function (filename, throwError = true) { tired.help.readJson(tired.location.folder + filename, throwError); }
tired.files.saveJson = function (filename, data) { return fs.writeFileSync(`${tired.location.folder}/${filename}`, JSON.stringify(data)); }
tired.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) { return tired.help.readDirFiles(tired.location.folder + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH); }

// Initialize the globals for our root & working directories
tired.root = require('./root.js');
tired.working = require('./working.js');

// Logging
tired.log.color = tired.root.require('lib/module/log/color.js');

// Helpers
tired.help.debounce = tired.root.require('lib/module/time/debounce.js');
tired.help.clone = function (data) { return JSON.parse(JSON.stringify(data)); };
tired.help.readLinkFile = tired.root.require('lib/module/files/readLinkFile.js');
tired.help.readDirFiles = tired.root.require('lib/module/files/readDirFiles.js');
tired.help.readJson = tired.root.require('lib/module/files/readDirFiles.js');
tired.help.getFileType = tired.root.require('lib/module/files/getFileType.js');
tired.help.caller = tired.root.require('lib/module/log/caller.js');