const svgo = require('svgo');

module.exports = {
	load: true, // Loads the file before process
	afterHtmlValidation: true,
	onload: async function (contents) {
		if (tired.cache.data.has('links/svg.js/onload', contents)) return tired.cache.data.get('links/svg.js/onload', contents);
		return tired.cache.data.set('links/svg.js/onload', contents, await svgo.optimize(contents).data);
	},
	process: async function (template, node, contents, lazymanager, FILE_PATH, PARENT_PATH) {
		// Inline it in the HTML
		if (node.attributes.inline != undefined) node.replaceWith(contents);
		else {
			const hookResponse = await tired.private.activateHook("html", "svg", "start", template, node, contents, FILE_PATH, PARENT_PATH);
			if (hookResponse.continue === false) return {};

			node.replaceWith("");
		}
		return {};
	}
}