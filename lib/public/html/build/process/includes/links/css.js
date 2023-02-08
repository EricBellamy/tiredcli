const minifyCSS = new (require('clean-css'));

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	minify: async function (contents) {
		return minifyCSS.minify(contents).styles;
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		// Callback hooks & stop processing if needed
		const hookReturn = await tired.private.activateHook("html", "css", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (!hookReturn.continue) return {};

		// Minify if needed & insert
		let minifyResult = contents;
		if (node.attributes.raw === undefined) minifyResult = await module.exports.minify(contents);
		node.replaceWith(`<style>${minifyResult}</style>`);

		return {};
	}
}