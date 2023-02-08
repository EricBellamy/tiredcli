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
	const files = {};
	for (const type in templates.types) {
		const typeData = templates.types[type];
		files[type] = tired.working.files.readDirFiles.forType(typeData.location, typeData.extension, false, '');;
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

async function loadModified(modified, names) {
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
				console.log(err);
				templateType.error(names[type]);
				return false;
			}
		}
	}
	if (modifiedCount === 0) return false;
	else return wasModified;
}

module.exports = {
	build: async function () {
		const files = getDirFiles();

		const buildResponses = {
			exports: [],
			includes: []
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

				const modifiedTypes = await loadModified(modified, names);

				// Nothing was modified
				if (modifiedTypes === false) continue;

				// Completely render the template
				const template = templates.data[names.base];
				const allData = templates.data[names.base].data;

				let count = 0;
				for (const data of allData) {
					count++;
					if (template.logic.limit != undefined && template.logic.limit < count) break;

					// We are saving the page + stringified data, then checking if it exists and continuining if it does
					// This basically means the template has been built for this data object and we don't need to rebuild it

					// We need to change it so that the page + stringified data is part of the key, and then the buildResponse is the cached value
					// Add this cached value to the response object and then continue

					// Check cache
					const cacheKey = tired.cache.key.fromMixed(names.base + count, template.page, data);
					if (tired.cache.data.get('build/templates.js/build', cacheKey)) {
						const cachedResponse = tired.cache.data.get('build/templates.js/build', cacheKey);
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
						includes: buildResponse.includes
					});
				}
			}
		} catch (err) {
			console.log(err);
		}

		return buildResponses;
	}
}