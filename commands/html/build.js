const html = tired.root.require("lib/public/html/build/html.js");
const templates = tired.root.require("lib/public/html/build/templates.js");
const document = tired.root.require("lib/public/html/build/document.js");
const exporter = tired.root.require("lib/public/html/build/exporter.js");

async function getIncludeSrcs(pages, pageResponses = {}) {
	// Get an array of include srcs for each page as well as the final HTML
	for (key in pages) {
		tired.html.currentFile = key;
		let initialDocument = await html.loadPage(key);
		const response = await document.getIncludeSrcs(key, initialDocument);

		// Infinite loop error
		if (response === false) return false;

		pageResponses[key] = response;
	}
	return true;
}

let initialBuild = true;
module.exports = {
	files: async function (changed = []) {
		// console.time("templates");

		const buildResponses = {
			exports: [],
			includes: []
		};

		// Build the templates now
		let hasTemplateChange = false;
		for (let a = 0; a < changed.length; a++) {
			if (changed[a].indexOf('templates/') === 0) {
				hasTemplateChange = true;
				changed.splice(a, 1);
				a--;
			}
		}
		if (initialBuild || hasTemplateChange) {
			const buildResponse = await templates.build();
			if (buildResponse === false) return false;

			tired.html.help.pushBuildResponse(buildResponses, buildResponse);

			if (!initialBuild && changed.length === 0) return buildResponses;
		}
		// console.timeEnd("templates");

		console.time("build");

		// Build the HTML includes for all page files & get all include URLs per page file
		let LAST_BUILD = tired.files.readJson("build_html.json", false);
		const rootPages = tired.working.files.readDirFiles.forType('', 'html', false, '');
		const nestedPages = tired.working.files.readDirFiles.forType('pages', 'html', false, 'pages');

		// Get the include srcs per page
		let pageResponses = {};
		const nestedPageErr = await getIncludeSrcs(nestedPages, pageResponses);
		if (nestedPageErr === false) return false;
		const rootPageErr = await getIncludeSrcs(rootPages, pageResponses);
		if (rootPageErr === false) return false;


		if (!initialBuild && changed.length != 0) {
			// Check if any of the changed files are included in any page
			for (const page in pageResponses) {
				const response = pageResponses[page];
				for (const include of response.includes) {
					if (changed.includes(include)) {
						const buildResponse = await document.build(page, response.document);
						if (buildResponse === false) return false;

						tired.html.help.pushBuildResponse(buildResponses, buildResponse);
						break;
					}
				}
			}
		} else if (initialBuild) {
			initialBuild = false;
			for (const page in pageResponses) {
				const buildResponse = await document.build(page, pageResponses[page].document);
				if (buildResponse === false) return false;

				tired.html.help.pushBuildResponse(buildResponses, buildResponse);
			}
		};

		await exporter.includes(buildResponses.exports); // Export the signaled include files
		await exporter.exportFolder(); // Move our export folder to dist

		await tired.private.activateHook("html", "build", "postprocess");
		await tired.private.activateHook("html", "build", "finish");

		console.log();
		console.timeEnd("build");

		return buildResponses;
	}
};