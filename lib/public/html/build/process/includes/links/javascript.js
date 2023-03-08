const { minify } = require("terser");

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	onePerPage: true,
	minify: async function (contents) {
		if (tired.cache.data.has('links/javascript.js/minify', contents)) return tired.cache.data.get('links/javascript.js/minify', contents);
		return tired.cache.data.set('links/javascript.js/minify', contents, (await minify(contents)).code);
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		const hookResponse = await tired.private.activateHook("javascript", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (hookResponse.continue === false) return {};

		let minifyResult = contents;
		if (node.attributes.raw === undefined) minifyResult = await module.exports.minify(contents);

		if(minifyResult.length != 0) node.replaceWith(`<script>${minifyResult}</script>`);
		else node.replaceWith("");

		return {};
	}
}