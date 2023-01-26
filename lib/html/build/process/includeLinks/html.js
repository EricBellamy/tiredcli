const fs = require('fs-extra');

function fillDataVariables(HTML_STRING, data) {
	let HTML_COPY = HTML_STRING;
	// Replace all regex matches
	while (true) {
		const regex = /{([^{]*)}/;
		const match = HTML_COPY.match(regex);
		if (match) {
			try {
				// Grab the parts
				const matchContents = match[1];
				const beforeMatch = HTML_COPY.substring(0, match.index);
				const afterMatch = HTML_COPY.substring(match.index + match[0].length);

				// Replace the match with data or nothing
				if (data[matchContents]) {
					HTML_COPY = beforeMatch + data[matchContents] + afterMatch;
				} else HTML_COPY = beforeMatch + afterMatch;
			} catch (err) {
				console.error(err);
				return HTML_STRING;
			}
		} else break;
	}
	return HTML_COPY;
}

module.exports = {
	load: true, // Loads the file before process
	minify: async function (contents) {
		return contents;
	},
	process: async function (template, node, contents) {
		const dataFilledHtml = fillDataVariables(contents, node.attributes);

		node.replaceWith(dataFilledHtml);
	}
}