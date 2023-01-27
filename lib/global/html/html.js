global.tired.html = {
	files: {},
	help: {}
};
global.tired.html.status = false;
global.tired.html.currentFile = false;
global.tired.html.folder = "html";

// Files
global.tired.html.files.read = function(name){ return global.tired.files.read(`${global.tired.html.folder}/${name}`); }
global.tired.html.files.readJson = function(name, throwError){ return global.tired.files.readJson(`${global.tired.html.folder}/${name}`, throwError); }
global.tired.html.files.saveJson = function(name, data){ global.tired.files.saveJson(`${global.tired.html.folder}/${name}`, data); }

// HTML Helpers
global.tired.html.help.HTMLParser = require('node-html-parser');