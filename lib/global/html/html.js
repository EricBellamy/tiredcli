tired.html = {
	files: {},
	help: {}
};
tired.html.status = false;
tired.html.currentFile = false;
tired.html.folder = "html";

// Files
tired.html.files.read = function(name){ return tired.files.read(`${tired.html.folder}/${name}`); }
tired.html.files.readJson = function(name, throwError){ return tired.files.readJson(`${tired.html.folder}/${name}`, throwError); }
tired.html.files.saveJson = function(name, data){ tired.files.saveJson(`${tired.html.folder}/${name}`, data); }

// HTML Helpers
tired.html.help.HTMLParser = require('node-html-parser');