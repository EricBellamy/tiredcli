const fs = require('fs-extra');

tired.html = {
	files: {},
	include: {},
	dist: {},
	help: {},
};
tired.html.status = false;
tired.html.currentFile = false;
tired.html.folder = "html";

// Files
tired.html.files.read = function (filename) { return tired.files.read(`${tired.html.folder}/${filename}`); }
tired.html.files.write = function (filename, dataString) { return tired.files.write(tired.html.folder + "/" + filename, dataString); };
tired.html.files.ensureDir = function (filename) { return tired.files.ensureDir(tired.html.folder + "/" + filename); };
tired.html.files.saveJson = function (filename, data) { tired.files.saveJson(`${tired.html.folder}/${filename}`, data); }
tired.html.files.readJson = function (filename, throwError) { return tired.files.readJson(`${tired.html.folder}/${filename}`, throwError); }
tired.html.files.stat = function (filename) { return tired.files.stat(`${tired.html.folder}/${filename}`); }


tired.html.files.privatePath = function (relativePath) { return `${tired.location.root}/lib/private/${tired.html.folder}/${relativePath}` };

tired.html.include.formatPath = function (filename) {
	return `${tired.location.working}/${filename}`
};

// Dist
tired.html.dist.absolutePath = `${tired.location.working}/${tired.location.folder}/${tired.html.folder}/dist/`;
tired.html.dist.write = function (filename, dataString) { return tired.html.files.write("dist/" + filename, dataString); };
tired.html.dist.ensureDir = function (filename) { return tired.html.files.ensureDir("dist/" + filename); };
tired.html.dist.formatExportPath = function (filename) { return `${tired.location.working}/${tired.location.folder}/${tired.html.folder}/dist/${filename}` };
tired.html.dist.formatRelativeExportPath = function (filename) { return `${tired.location.folder}/${tired.html.folder}/dist/${filename}` };
tired.html.dist.formatExportFolder = function (filename) {
	const filePath = `${tired.location.working}/${tired.location.folder}/${tired.html.folder}/dist/${filename}`;
	return filePath.substring(0, filePath.lastIndexOf("/"));
};
tired.html.dist.ensureEmptyDist = function () {
	const targetPath = `${tired.location.folder}/${tired.html.folder}/dist`;
	fs.ensureDirSync(targetPath);

	const validDirs = [];
	const validIncludeDirs = [];

	// Get the root directories to clear
	const dirs = tired.working.files.readDirs(targetPath, [], false, "");
	const dirIgnores = ["include"];
	for (const dirPath in dirs) {
		if (!dirIgnores.includes(dirPath)) validDirs.push(dirPath);
	}

	// Get the nested include directories to clear
	const includeDirs = tired.working.files.readDirs(targetPath + "/include", [], false, "");
	const includeIgnores = ["ico", "jpg", "png", "svg", "webp", "avif"];
	for (const dirPath in includeDirs) {
		if (!includeIgnores.includes(dirPath)) validIncludeDirs.push(dirPath);
	}

	// Clear the root dirs & include dirs
	validDirs.map(x => {
		fs.emptyDirSync(`${targetPath}/${x}`);
	});
	validIncludeDirs.map(x => {
		fs.emptyDirSync(`${targetPath}/include/${x}`);
	});
}

tired.html.dist.tracking = {
	initialized: false,
	modified: {},
	cache: {}, // The cache for the current build
	init: function () {
		if (this.initialized === false) this.modified = tired.html.files.readJson("dist.json", false);
		this.initialized = true;
		this.cache = {};
	},
	save: function () {
		return tired.html.files.saveJson("dist.json", this.modified);
	},

	stat: function(src){
		return tired.working.files.stat(src).mtimeMs;
	},
	updateModified: function (src, value) {
		this.modified[src] = {
			modified: value,
			build: tired.private.env("build_number")
		}
		this.cache[src] = value;
	},
	wasModified: function (src, update = false, manualInputFileSrc = false) {
		let returnValue = false;

		// If we have a cache at all, it means something in the program has already exported this src
		if (this.cache[src]) returnValue = false;
		else {
			// Get the stats of the file
			const mtimeMs = this.stat(manualInputFileSrc === false ? src : manualInputFileSrc);

			// Get the return value
			if (this.modified[src] === undefined) returnValue = true; // If no existing modified time
			else if (this.modified[src].modified !== mtimeMs) returnValue = true; // If existing modified time is different

			// Update the stores
			if (update) this.updateModified(src, mtimeMs);
		}
		return returnValue;
	},
	update: function (src, manualInputFileSrc = false) {
		// Fix absolute paths since they're easier to detect
		const distPathBase = `${tired.location.working}/${tired.location.folder}/${tired.html.folder}/dist/`;
		if (src.indexOf(distPathBase) === 0) src = src.split(distPathBase)[1]

		if (this.cache[src]) return false;

		const mtimeMs = this.stat(manualInputFileSrc === false ? src : manualInputFileSrc);

		this.updateModified(src, mtimeMs);

		return true;
	}
}

// HTML Helpers
tired.html.help.HTMLParser = require('node-html-parser');
tired.html.help.pushBuildResponse = function (main, response) {
	for (const include of response.includes) if (!main.includes.includes(include)) main.includes.push(include);
	for (const exportItem of response.exports) if (!main.exports.includes(exportItem)) main.exports.push(exportItem);
	if (response.document) main.documents.push(response.document);
}

tired.html.help.formatIncludeSrc = function (src, filetype = "") {
	if (filetype.length === 0) filetype = tired.help.getFileType(src);
	return `include/${filetype}/${src}`;
}

tired.html.attributes = tired.root.require('/lib/public/module/html/attributes.js');