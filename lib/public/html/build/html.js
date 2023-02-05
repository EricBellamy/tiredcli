const preprocessHtml = require('./process/pre.js');
const includes = require('./process/includes.js');

module.exports = {
	reset: function () {
		includes.reset();
	},

	loadTemplate: async function (templateHtml, templateData = {}) {
		const cacheKey = tired.cache.key.fromMixed(templateHtml, templateData);
		if (tired.cache.data.has('build/html.js/loadTemplate', cacheKey)) return tired.html.help.HTMLParser.parse(tired.cache.data.get('build/html.js/loadTemplate', cacheKey));

		// Loads the template from the template folder using the HTML & JSON
		const html = await tired.working.files.readLinkFile.processFile(templateHtml, 'html', templateData);
		const returnVal = tired.html.help.HTMLParser.parse(html);

		// Set the cache
		tired.cache.data.set('build/html.js/loadTemplate', cacheKey, html);
		return returnVal;
	},

	loadPage: async function (filePath) {
		const html = await tired.working.files.readLinkFile(filePath, {});
		return tired.html.help.HTMLParser.parse(html);
	},
	getIncludes: async function (document, data = {}) {
		return await includes.processHTMLIncludes(tired.html.currentFile, document, data);
	},

	// Build functions
	buildPage: async function (key, document, log = true) {
		if (log) tired.log.color(['yellow', '\n[html.js/buildPage] Building page "'],
			['cyan', key],
			['yellow', '"']);
		tired.html.currentFile = key;

		// Reset the private library executions
		await tired.private.resetHookExecutions('html');

		await module.exports.preprocess(document, key);
		const beforeValidation = await module.exports.buildForValidation(document, key);
		if (beforeValidation === false) return false;

		const afterValidation = await module.exports.buildPostValidation(document, key);
		if (afterValidation === false) return false;

		// Use the tracked private library executions
		await tired.private.processNecessary('html', document);

		// Do something with the included files
		// const includesList = beforeValidation.includes.concat(afterValidation.includes);

		// Write the HTML file here
		return document;
	},
	preprocess: async function (document, FILE_PATH) {
		// Fix generic HTML format errors
		return await preprocessHtml(document, FILE_PATH);
	},
	buildForValidation: async function (document, key = "", data = {}) {
		return await includes.processDocument(key, document, data, false);
	},
	buildPostValidation: async function (document, key = "", data = {}) {
		return await includes.processDocument(key, document, data, true);
	},

}