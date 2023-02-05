const includeLinks = tired.root.require('lib/public/html/build/process/includes/links.js');

const cache = {
	html: {},
	documents: {}
}

function formatIncludeSrc(src, filetype = "") {
	return `include/${filetype}/${src}`;
}

function getIncludeSrcsFromText(text) {
	let srcs = [];
	const document = tired.html.help.HTMLParser.parse(text);
	const nodes = document.querySelectorAll("include");
	for (const node of nodes) {
		srcs.push(node.attributes.src);
	}
	return srcs;
}

function validateIncludePath(existing, currentSrc, newSrcs) {
	for (const src of newSrcs) {
		if (existing[currentSrc] === undefined) existing[currentSrc] = [];
		existing[currentSrc].push(src);

		// Check if this is looping
		if (existing[src] != undefined && existing[src].includes(currentSrc)) {
			tired.log.color(['red', `[includes.js/validateIncludePath] Looping include detected `],
				['magenta', currentSrc],
				['red', ` -> `],
				['magenta', src],
				['red', ` in file `],
				['magenta', tired.html.currentFile]);
			return false;
		}
	}
	return true;
}

module.exports = {
	getNodes: function (document, type) {
		return document.querySelectorAll("include");
	},
	getNodesOfType: function (document, type) {
		return document.querySelectorAll(`include[src$=".${type}"]`);
	},

	processHTMLIncludes: async function (key, document, data = {}) {
		// Create key & check cache
		// const cacheKey = key + tired.cache.key.fromObject(data);
		const cacheKey = tired.cache.key.fromMixed(key, document.toString(), data);

		if (tired.cache.data.has('process/includes.js/html', cacheKey)) {
			return {
				includes: tired.cache.data.get('process/includes.js/html', cacheKey),
				document: document,
			};
		}

		// Process
		let included = [tired.html.currentFile];

		let nodes = module.exports.getNodesOfType(document, "html");
		const requirePaths = {};

		while (nodes.length != 0) {
			for (const node of nodes) {
				included.push(formatIncludeSrc(node.attributes.src, "html"));

				const contents = await tired.working.files.readText("include/html/" + node.attributes.src);

				// Make sure we're not in an infinite loop
				const nestedSrcs = getIncludeSrcsFromText(contents);
				if (!validateIncludePath(requirePaths, node.attributes.src, nestedSrcs)) return false;

				// Process the HTML
				await includeLinks.html.minify(contents);
				await includeLinks.html.process(document, node, contents);
			}

			nodes = module.exports.getNodesOfType(document, "html");
		}

		// Set the cache
		const output = {
			includes: included,
			document: document
		};
		tired.cache.data.set('process/includes.js/html', cacheKey, included);
		return output;
	},

	processDocument: async function (key, document, data = {}, isAfterValidation = false) {
		// Create key & check cache
		const cacheKey = key + isAfterValidation + tired.cache.key.fromObject(data);
		if (tired.cache.data.has('process/includes.js/documents', cacheKey)) return tired.cache.data.get('process/includes.js/documents', cacheKey);

		// Process
		let included = [];

		// Process the contents
		let nodes = module.exports.getNodes(document);
		for (const node of nodes) {
			const src = node.attributes.src;
			const filetype = tired.help.getFileType(src);
			const link = includeLinks[filetype];

			// If we're only processing links after validation, skip this one
			if (isAfterValidation === true && link.afterHtmlValidation === true) continue;

			if (link === undefined) {
				tired.log.color(['red', `[includes.js/processDocument] Unsupported filetype `],
					['magenta', filetype],
					['red', ` in file `],
					['magenta', tired.html.currentFile]);
				node.replaceWith("");
				return false;
			}

			included.push(formatIncludeSrc(src, filetype));

			// Process the file
			let contents;
			if (link.load) contents = await tired.working.files.readText(`include/${filetype}/${src}`);
			if (link.compile) contents = await link.compile(contents);
			if (link.minify) contents = await link.minify(contents);
			await link.process(document, node, contents);
		}

		// Set the cache
		const output = {
			includes: included,
			document: document
		};
		return tired.cache.data.set('process/includes.js/documents', cacheKey, output);
	}
}