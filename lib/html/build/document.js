const html = tired.root.require("lib/html/build/html.js");

module.exports = {
	getIncludeSrcs: async function (page, document, data = {}) {
		// Get an array of include srcs for each page as well as the final HTML
		tired.html.currentFile = page;
		const response = await html.getIncludes(document, data);

		// Infinite loop error
		if (response === false) return false;

		return response;
	},
	build: async function(page, document) {
		// Build & Clean the HTML
		const pageDocument = await html.buildPage(page, document);
		pageDocument.removeWhitespace();

		// Write the HTML file
		let exportPath = page.indexOf("pages/") === 0 ? page.substring("pages/".length) : page;
		if(exportPath.lastIndexOf('/') != -1) tired.html.dist.ensureDir(exportPath.substring(0, exportPath.lastIndexOf('/')));
		tired.html.dist.write(exportPath, pageDocument.toString());
	}
}