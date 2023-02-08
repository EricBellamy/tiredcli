tired.html = {
	files: {},
	help: {},
	dist: {}
};
tired.html.status = false;
tired.html.currentFile = false;
tired.html.folder = "html";

// Files
tired.html.files.read = function (filename) { return tired.files.read(`${tired.html.folder}/${filename}`); }
tired.html.files.write = function (filename, dataString) { return tired.files.write(tired.html.folder + "/" + filename, dataString); };
tired.html.files.ensureDir = function (filename) { return tired.files.ensureDir(tired.html.folder + "/" + filename); };
tired.html.files.readJson = function (filename, throwError) { return tired.files.readJson(`${tired.html.folder}/${filename}`, throwError); }
tired.html.files.saveJson = function (filename, data) { tired.files.saveJson(`${tired.html.folder}/${filename}`, data); }

tired.html.files.privatePath = function (relativePath) { return `${tired.location.root}/lib/private/${tired.html.folder}/${relativePath}` };

// Dist
tired.html.dist.write = function (filename, dataString) { return tired.html.files.write("dist/" + filename, dataString); };
tired.html.dist.ensureDir = function (filename) { return tired.html.files.ensureDir("dist/" + filename); };

// HTML Helpers
tired.html.help.HTMLParser = require('node-html-parser');
tired.html.help.pushBuildResponse = function (main, response) {
	for (const include of response.includes) if (!main.includes.includes(include)) main.includes.push(include);
	for (const exportItem of response.exports) if (!main.exports.includes(exportItem)) main.exports.push(exportItem);
}

tired.html.help.formatIncludeSrc = function(src, filetype = "") {
	if(filetype.length === 0) filetype = tired.help.getFileType(src);
	return `include/${filetype}/${src}`;
}