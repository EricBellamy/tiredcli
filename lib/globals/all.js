const path = require('path');
const fs = require('fs-extra');

global.tired = {};
global.tired.require = function (requirePath) { return require(global.tired.files.root + "/" + requirePath); }
global.tired.loadGlobal = function (name) {
	if (name != "all") return require(`./${name}.js`);
}

global.tired.files = {};
global.tired.files.folder = ".tired";
global.tired.files.root = path.join(__dirname + "/../..");
global.tired.files.read = function (filename) { return fs.readFileSync(`${global.tired.files.folder}/${filename}`); }
global.tired.files.saveJson = function (filename, data) { return fs.writeFileSync(`${global.tired.files.folder}/${filename}`, JSON.stringify(data)); }

global.tired.help = {};
global.tired.help.debounce = global.tired.require('lib/modules/time/debounce.js');
global.tired.help.clone = function (data) { return JSON.parse(JSON.stringify(data)); };