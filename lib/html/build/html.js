const preprocessHtml = require('./process/pre.js');
const includes = require('./process/includes.js');

module.exports = {
	reset: function () {
		includes.reset();
	},

	loadPage: async function (FILE_PATH) {
		const html = tired.working.files.readText(FILE_PATH);
		const document = tired.html.help.HTMLParser.parse(html);

		return document;
	},
	getIncludes: async function (document) {
		return await includes.processHTMLIncludes(tired.html.currentFile, document, { hello: "world" });;
	},

	// Build functions
	buildPage: async function (key, document, log = true) {
		if (log) tired.log.color(['yellow', '\n[html.js/buildPage] Building page "'],
			['cyan', key],
			['yellow', '"']);
		tired.html.currentFile = key;

		await module.exports.preprocess(document, key);
		const beforeValidation = await module.exports.buildForValidation(document, key);
		if (beforeValidation === false) return false;

		const afterValidation = await module.exports.buildPostValidation(document, key);
		if (afterValidation === false) return false;

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