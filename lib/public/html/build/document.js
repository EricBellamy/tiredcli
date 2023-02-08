const html = tired.root.require("lib/public/html/build/html.js");

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
		const buildResponse = await html.buildPage(page, document);
		if(buildResponse === false) return false;
		
		buildResponse.document.removeWhitespace();

		// Write the HTML file
		let exportPath = page.indexOf("pages/") === 0 ? page.substring("pages/".length) : page;
		if(exportPath.lastIndexOf('/') != -1) tired.html.dist.ensureDir(exportPath.substring(0, exportPath.lastIndexOf('/')));
		tired.html.dist.write(exportPath, buildResponse.document.toString());

		return buildResponse;
	}
}