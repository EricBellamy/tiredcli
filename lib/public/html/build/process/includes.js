const includeLinks = tired.root.require('lib/public/html/build/process/includes/links.js');

const cache = {
	html: {},
	documents: {}
}

function getIncludeSrcs(document) {
	let srcs = [];
	const nodes = document.querySelectorAll("include");
	for (const node of nodes) {
		const src = node.attributes.src;
		srcs.push(tired.html.help.formatIncludeSrc(src));
	}
	return srcs;
}
function getIncludeSrcsFromText(text) {
	const document = tired.html.help.HTMLParser.parse(text);
	return getIncludeSrcs(document);
}

function validateIncludePath(existing, currentSrc, newSrcs) {
	for (const src of newSrcs) {
		if (existing[currentSrc] === undefined) existing[currentSrc] = [];
		existing[currentSrc].push(src);

		// Check if this is looping
		if (existing[src] != undefined && existing[src].includes(currentSrc)) {
			tired.log.color('includes.js/validateIncludePath', ['red', `Looping include detected `],
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
		const cacheKey = tired.cache.key.fromMixed(key, document.toString(), data);

		if (tired.cache.data.has('process/includes.js/html', cacheKey)) {
			const cacheValue = tired.cache.data.get('process/includes.js/html', cacheKey);
			return {
				includes: cacheValue.includes,
				document: tired.html.help.HTMLParser.parse(cacheValue.document)
			};
		}

		// Process
		let included = [tired.html.currentFile];

		let nodes = module.exports.getNodesOfType(document, "html");
		const requirePaths = {};

		while (nodes.length != 0) {
			for (const node of nodes) {
				included.push(tired.html.help.formatIncludeSrc(node.attributes.src, "html"));

				let contents;
				try {
					contents = await tired.working.files.readText("include/html/" + node.attributes.src);
					contents = await includeLinks.html.onload(contents, node.attributes);
				} catch (err) {
					contents = "";
					tired.log.color.start('includes.js/processHTMLIncludes');
					tired.log.color("includes.js/processHTMLIncludes",
						["red", "Error loading HTML include "],
						["magenta", node.attributes.src],
						["red", " in file "],
						["magenta", tired.html.currentFile]
					);
					tired.log.color.stop('includes.js/processHTMLIncludes');
				}

				// Make sure we're not in an infinite loop
				const nestedSrcs = getIncludeSrcsFromText(contents);
				if (!validateIncludePath(requirePaths, node.attributes.src, nestedSrcs)) return false;

				// Process the HTML
				await includeLinks.html.process(document, node, contents);
			}

			nodes = module.exports.getNodesOfType(document, "html");
		}

		const nonHtmlIncludes = getIncludeSrcs(document);
		included = included.concat(nonHtmlIncludes);

		// Set the cache
		const output = {
			includes: included,
			document: document
		};
		tired.cache.data.set('process/includes.js/html', cacheKey, {
			includes: included,
			document: document.toString()
		});
		return output;
	},

	processDocument: async function (key, document, data = {}, isAfterValidation = false) {
		// Process
		let included = [];
		let exported = [];

		tired.log.color.start('includes.js/processDocument');

		// Process the contents
		let nodes = module.exports.getNodes(document);
		for (const node of nodes) {
			const src = node.attributes.src;
			const filetype = tired.help.getFileType(src);
			const link = includeLinks[filetype];

			// If we're only processing links after validation, skip this one
			if (isAfterValidation === true && link.afterHtmlValidation === true) continue;

			if (link === undefined) {
				if (0 < filetype.length) {
					tired.log.color('includes.js/processDocument', ['red', `Unsupported filetype "`],
						['magenta', filetype],
						['red', `" in file `],
						['magenta', tired.html.currentFile]);
				} else {
					tired.log.color('includes.js/processDocument', ['red', `Include missing an src "`],
						['magenta', node.outerHTML],
						['red', `" in file `],
						['magenta', tired.html.currentFile]);
				}
				node.replaceWith("");
				return false;
			}

			const includeSrc = tired.html.help.formatIncludeSrc(src, filetype);

			// Skip reprocessing if we can only have one per page of this type for this src
			if (node.attributes.src, included.includes(includeSrc) && link.onePerPage === true) {
				node.replaceWith("");
				continue;
			}
			included.push(includeSrc);

			// Process the file
			let contents;
			try {
				if (link.load) contents = await tired.working.files.readText(includeSrc);
				if (link.onload) contents = await link.onload(contents);
				if (link.minify) contents = await link.minify(contents);

				const processResult = await link.process(document, node, contents, key);
				if (processResult.export) exported.push(includeSrc);
			} catch (err) {
				switch (err.code) {
					case "ENOENT":
						tired.log.color('includes.js/processDocument', ['yellow', 'Include "'],
							['magenta', includeSrc],
							['yellow', '" does not exist called from page "'],
							['magenta', key],
							['yellow', '"']);
						break;
					default:
						tired.log.color('includes.js/processDocument', ['red', 'Include processing error "'],
							['magenta', err.message],
							['red', '"']);
						node.replaceWith("");
						break;
				}
			}
		}

		tired.log.color.stop('includes.js/processDocument');

		// Set the cache
		return {
			includes: included,
			exports: exported,
			document: document
		};
	}
}