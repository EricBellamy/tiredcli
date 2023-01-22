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
global.tired.loadGlobal = function (name) {
	if (name != "all") return require(`./${name}/${name}.js`);
}

// Location info
global.tired.location.folder = ".tired";
global.tired.location.root = path.join(__dirname + "/../..");
global.tired.location.working = process.cwd();

// File Functions
global.tired.files.read = function (filename) { return fs.readFileSync(`${global.tired.location.folder}/${filename}`); }
global.tired.files.readJson = function (filename, throwError = true) { global.tired.help.readJson(global.tired.location.folder + filename, throwError); }
global.tired.files.saveJson = function (filename, data) { return fs.writeFileSync(`${global.tired.location.folder}/${filename}`, JSON.stringify(data)); }
global.tired.files.readDirFiles = function (CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH) { return global.tired.help.readDirFiles(global.tired.location.folder + CURRENT_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_PATH); }

// Initialize the globals for our root & working directories
global.tired.root = require('./root/root.js');
global.tired.working = require('./working/working.js');

// Logging
global.tired.log.color = global.tired.root.require('lib/module/log/color.js');

// Helpers
global.tired.help.debounce = global.tired.root.require('lib/module/time/debounce.js');
global.tired.help.clone = function (data) { return JSON.parse(JSON.stringify(data)); };
global.tired.help.readDirFiles = global.tired.root.require('lib/module/files/readDirFiles.js');
global.tired.help.readJson = global.tired.root.require('lib/module/files/readDirFiles.js');