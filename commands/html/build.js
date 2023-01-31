const html = tired.root.require("lib/html/build/html.js");

async function getIncludeSrcs(pages, pageResponses = {}) {
	// Get an array of include srcs for each page as well as the final HTML
	for (key in pages) {
		tired.html.currentFile = key;
		let initialDocument = await html.loadPage(key);
		const response = await html.getIncludes(initialDocument);

		// Infinite loop error
		if (response === false) return false;

		pageResponses[key] = response;
	}
	return true;
}

async function buildDocument(page, document) {
	// Build & Clean the HTML
	const pageDocument = await html.buildPage(page, document);
	pageDocument.removeWhitespace();

	// Write the HTML file
	const exportPath = page.indexOf("pages/") === 0 ? page.substring("pages/".length) : page;
	tired.html.dist.write(exportPath, pageDocument.toString());
}

module.exports = async function (changed = []) {
	// Build the HTML includes for all page files & get all include URLs per page file
	let LAST_BUILD = tired.files.readJson("build_html.json", false);
	const rootPages = tired.working.files.readDirFiles.forType('', 'html', false, '');
	const nestedPages = tired.working.files.readDirFiles.forType('pages', 'html', false, 'pages');

	// Get the include srcs per page
	let pageResponses = {};
	// const nestedPageErr = await getIncludeSrcs(nestedPages, pageResponses);
	// if (nestedPageErr === false) return false;
	const rootPageErr = await getIncludeSrcs(rootPages, pageResponses);
	if (rootPageErr === false) return false;

	if (changed.length != 0) {
		// Check if any of the changed files are included in any page
		for (const page in pageResponses) {
			const response = pageResponses[page];
			for (const include of response.includes) if (changed.includes(include)) await buildDocument(page, response.document);
		}
	} else {
		for (const page in pageResponses) await buildDocument(page, pageResponses[page].document);
	}
	html.reset();
}