const sass = require('node-sass');

// Our CSS handler for the compiled SCSS
const cssLink = tired.root.require('lib/public/html/build/process/includes/links/css.js');

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	minify: async function (contents) {
		return await cssLink.minify(contents.toString());
	},
	onload: async function (contents) {
		try {
			const result = sass.renderSync({
				data: contents
			});
			return result.css.toString();
		} catch(err){
			console.log(err);
			return '';
		}
	},
	exportPath: function (path) {
		return path.split('.scss')[0] + ".css";
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		// Callback hooks & stop processing if needed
		const hookResponse = await tired.private.activateHook("html", "scss", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (hookResponse.continue === false) return;

		if (node.attributes.raw === undefined) contents = await module.exports.minify(contents);
		node.replaceWith(`<style>${contents}</style>`);
	}
}