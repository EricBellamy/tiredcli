const minifyCSS = new (require('clean-css'));

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	minify: async function (contents) {
		if (tired.cache.data.has('links/css.js/minify', contents)) return tired.cache.data.get('links/css.js/minify', contents);
		return tired.cache.data.set('links/css.js/minify', contents, minifyCSS.minify(contents).styles);
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		// Callback hooks & stop processing if needed
		const hookReturn = await tired.private.activateHook("html", "css", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (!hookReturn.continue) return {};

		// Minify if needed & insert
		let minifyResult = contents;
		if (node.attributes.raw === undefined) minifyResult = await module.exports.minify(contents);

		if(minifyResult.length != 0) node.replaceWith(`<style>${minifyResult}</style>`);
		else node.replaceWith("");

		return {};
	}
}