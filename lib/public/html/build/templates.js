const fs = require('fs-extra');
const importFresh = require('import-fresh');

// Local requires
const html = tired.root.require("lib/public/html/build/html.js");
const document = tired.root.require("lib/public/html/build/document.js");

// Cache the template data && check modified time of file before reloading
// If nothing has been modified, don't generate the template

const templates = {
	modified: {},
	data: {},
	inputData: {}, // Data objects to be used by the rest of the pipeline
	types: {
		page: {
			location: "templates/page",
			extension: "html",
			load: async function (filename) {
				return await tired.working.files.readText(this.location + '/' + filename);
			},
			error: function (name) {
				tired.log.color('templates.js/build', ['red', `Failed when reading page file "`],
					['magenta', name],
					['red', `"`], false);
			}
		},
		logic: {
			location: "templates/logic",
			extension: "js",
			load: async function (filename) {
				return importFresh(tired.location.working + '/' + this.location + '/' + filename);
			},
			error: function (name) {
				tired.log.color('templates.js/build', ['red', `Failed when reading logic file "`],
					['magenta', name],
					['red', `"`], false);
			}
		},
		data: {
			location: "templates/data",
			extension: "json",
			load: async function (filename) {
				return JSON.parse(await tired.working.files.readText(this.location + '/' + filename, true));
			},
			error: function (name) {
				tired.log.color('templates.js/build', ['red', `Issue reading JSON file "`],
					['magenta', name],
					['red', `"`], false);
			}
		}
	}
};

function getDirFiles() {
	const files = {
		names: [],
	};
	for (const type in templates.types) {
		const typeData = templates.types[type];
		files[type] = tired.working.files.readDirFiles.forType(typeData.location, typeData.extension, false, '');;
		for (const fileKey in files[type]) {
			const filename = fileKey.substring(0, fileKey.lastIndexOf("."));
			if (!files.names.includes(filename)) files.names.push(filename);
		}
	}
	return files;
}

function getNames(htmlFileName) {
	const output = { base: htmlFileName.split(".")[0] };
	for (const type in templates.types) {
		const typeData = templates.types[type];
		output[type] = output.base + "." + typeData.extension;
	}
	return output;
}

function getModified(names) {
	const modified = {};
	for (const type in templates.types) {
		const typeData = templates.types[type];
		modified[type] = tired.working.files.modified(typeData.location + '/' + names[type]);
	}
	return modified;
}

async function loadModified(modified, names, files) {
	if (templates.data[names.base] === undefined) {
		templates.data[names.base] = {};
		templates.modified[names.base] = {};
	}

	let modifiedCount = 0;
	const wasModified = [];
	for (const type in modified) {
		const templateType = templates.types[type];
		if (modified[type] != templates.modified[names.base][type]) {
			modifiedCount++;
			wasModified.push(type);
			try {
				templates.data[names.base][type] = await templateType.load(names[type]);
				templates.modified[names.base][type] = modified[type];
			} catch (err) {
				if (files[type][names[type]] != undefined) {
					templateType.error(names[type]);
					return false;
				}
			}
		}

		if (type === "data") {
			templates.inputData[names.base] = templates.data[names.base].data;
			tired.private.env("templates.js", templates.inputData);
		}
	}

	if (modifiedCount === 0) return false;
	else return wasModified;
}

module.exports = {
	getTemplateData: function () {
		return templates;
	},
	loadData: async function () {
		const files = getDirFiles();

		const buildResponses = {
			exports: [],
			includes: [],
			documents: []
		};

		try {
			// for (const templateHtmlName in files.page) {
			for (const fileName of files.names) {
				const names = getNames(fileName);
				delete names.page;

				if (files.data[names.data] === undefined) return tired.log.color('templates.js/build', ['red', `Missing data file "`],
					['magenta', names.data],
					['red', `" for template "`],
					['magenta', fileName],
					['red', `"`], false);

				// Get the modified times
				const modified = getModified(names);
				const modifiedTypes = await loadModified(modified, names, files);
			}
		} catch (err) {
			console.log(err);
		}
	},
	buildPages: async function () {
		const files = getDirFiles();

		const buildResponses = {
			exports: [],
			includes: [],
			documents: []
		};

		try {
			for (const templateHtmlName in files.page) {
				const names = getNames(templateHtmlName);

				if (files.data[names.data] === undefined) return tired.log.color('templates.js/build', ['red', `Missing data file "`],
					['magenta', names.data],
					['red', `" for template "`],
					['magenta', templateHtmlName],
					['red', `"`], false);

				// Get the modified times
				const modified = getModified(names);

				const modifiedTypes = await loadModified(modified, names, files);

				// Nothing was modified
				if (modifiedTypes === false) continue;

				// Completely render the template
				const template = templates.data[names.base];
				const allData = templates.data[names.base].data;

				// If we have no page for this template, skip it
				if (template.page === undefined) continue;

				let count = 0;
				if(allData.pages === undefined) allData.pages = [];
				for (const data of allData.pages) {
					count++;
					if ((tired.private.env("processing") != "prod" || 5 < count) && template.logic.limit != undefined && template.logic.limit < count) break;

					// Check cache
					const cacheKey = tired.cache.key.fromMixed(names.base + count + template.logic.limit, template.page, data);
					if (tired.cache.data.get('build/templates.js/build', cacheKey)) {
						const cachedResponse = tired.cache.data.get('build/templates.js/build', cacheKey);
						cachedResponse.document = tired.html.help.HTMLParser.parse(cachedResponse.document);
						cachedResponse.document.storedPageKey = cachedResponse.pageKey;

						tired.html.help.pushBuildResponse(buildResponses, cachedResponse);
						continue;
					}

					// Create the page key
					let pageKey = data.name;
					if (pageKey === undefined) pageKey = data.title.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-');
					if (pageKey.length === 0) continue;
					pageKey = names.base + '/' + pageKey + '.html';

					// Process the template object
					const initialDocument = await html.loadTemplate(template.page, data);
					const response = await document.getIncludeSrcs(pageKey, initialDocument);
					const buildResponse = await document.build(pageKey, response.document);
					if (buildResponse === false) return false;

					tired.html.help.pushBuildResponse(buildResponses, buildResponse);

					tired.cache.data.set('build/templates.js/build', cacheKey, {
						exports: buildResponse.exports,
						includes: buildResponse.includes,
						document: buildResponse.document.toString(),
						pageKey: pageKey
					});
				}
			}
		} catch (err) {
			console.log(err);
		}

		return buildResponses;
	}
}