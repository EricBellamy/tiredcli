const { minify } = require("terser");

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	minify: async function (contents) {
		return (await minify(contents)).code;
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		const hookResponse = await tired.private.activateHook("javascript", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (hookResponse.continue === false) return {};

		let minifyResult = contents;
		if (node.attributes.raw === undefined) minifyResult = await module.exports.minify(contents);
		node.replaceWith(`<script>${minifyResult}</script>`);

		return {};
	}
}