const preprocessHtml = require('./process/pre.js');
const includes = require('./process/includes.js');

module.exports = {
	reset: function () {
		includes.reset();
	},

	loadTemplate(FILE_PATH){
		// Loads the template from the template folder using the HTML & JSON
		
		// const templateAttributes = {};
		// const html = tired.working.files.readLinkFile(FILE_PATH, templateAttributes);
	},

	loadPage: async function (FILE_PATH) {
		const html = await tired.working.files.readLinkFile(FILE_PATH, {
			title: "EXAMPLE TITLE",
			recipes: [{
				title: "Vodka martini",
				description: "A delicious martini"
			}, {
				title: "Old Fashioned",
				description: "A delicious old fashioned"
			}],
			poo: {
				value: {
					hourly: {
						sum: 420,
						total: 999
					}
				}
			}
		});
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