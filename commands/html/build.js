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

async function buildTemplates(changed, buildResponses) {
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
		await templates.loadData();
		await templates.runInit();
		const buildResponse = await templates.buildPages();
		if (buildResponse === false) return false;

		for (const document of buildResponse.documents) buildResponses.documents.push(document);

		tired.html.help.pushBuildResponse(buildResponses, buildResponse);

		if (!initialBuild && changed.length === 0) return false;
	}
	return true;
}

async function finishBuild(buildResponses, BUILD_JSON) {
	await exporter.includes(buildResponses.exports); // Export the signaled include files

	if (active.exports) await exporter.exportFolder(); // Move our export folder to dist

	await tired.private.activateHook("html", "build", "beforewrite");

	// Build the documents now
	document.writeDocuments(buildResponses.documents);

	await tired.private.activateHook("html", "build", "finish");

	await tired.private.activateHook("html", "build", "postprocess1");

	console.log();
	console.timeEnd("build");

	tired.html.dist.tracking.save();
	if (tired.private.env("processing") === "prod") tired.html.files.saveJson("build.json", BUILD_JSON);

	return buildResponses;
}

const active = {
	template: true,
	nested: false,
	root: true,
	exports: false,
}

let initialBuild = true;
module.exports = {
	reset: function () {
		initialBuild = true;
		const templateData = templates.getTemplateData();
		templateData.modified = {};
		templateData.data = {};

		this.resetCache();
	},
	resetCache: function(){
		tired.cache.data.clear("build/templates.js/build");
		tired.cache.data.clear("process/includes.js/html");
	},
	files: async function (changed = []) {
		console.time("build");

		tired.private.env("build_time", new Date().getTime());

		const BUILD_JSON = tired.html.files.readJson("build.json", false);
		if (tired.private.env("processing") === "prod") {
			BUILD_JSON.number = BUILD_JSON.number != undefined ? BUILD_JSON.number + 1 : 1;
			BUILD_JSON.time = new Date().getTime();
		}
		tired.private.env("build_number", BUILD_JSON.number);

		const buildResponses = {
			exports: [],
			includes: [],
			documents: [],
		};

		// Initialize our dist tracking
		tired.html.dist.tracking.init();

		if (active.template) {
			const templateStatus = await buildTemplates(changed, buildResponses);
			if (templateStatus === false) return await finishBuild(buildResponses, BUILD_JSON);
		}

		// Get the include srcs per page
		let pageResponses = {};

		if (active.nested) {
			const nestedPages = tired.working.files.readDirFiles.forType('pages', 'html', false, 'pages');
			const nestedPageErr = await getIncludeSrcs(nestedPages, pageResponses);
			if (nestedPageErr === false) return false;
		}
		if (active.root) {
			const rootPages = tired.working.files.readDirFiles.forType('', 'html', false, '');
			const rootPageErr = await getIncludeSrcs(rootPages, pageResponses);
			if (rootPageErr === false) return false;
		}

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

		return await finishBuild(buildResponses, BUILD_JSON);
	}
};