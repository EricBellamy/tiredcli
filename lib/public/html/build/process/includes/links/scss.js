const sass = require('node-sass');

// Our CSS handler for the compiled SCSS
const cssLink = tired.root.require('lib/public/html/build/process/includes/links/css.js');

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	onePerPage: true,
	minify: async function (contents) {
		if (tired.cache.data.has('links/scss.js/minify', contents)) return tired.cache.data.get('links/scss.js/minify', contents);
		return tired.cache.data.set('links/scss.js/minify', contents, await cssLink.minify(contents.toString()));
	},
	onload: async function (contents) {
		if (tired.cache.data.has('links/scss.js/onload', contents)) return tired.cache.data.get('links/scss.js/onload', contents);
		try {
			const result = sass.renderSync({
				data: contents
			});
			return tired.cache.data.set('links/scss.js/onload', contents, result.css.toString());
		} catch (err) {
			tired.log.color.start('scss.js');
			tired.log.color('scss.js', ['red', 'Error when compiling "'],
				['magenta', err.message],
				['red', '"']);
			tired.log.color.stop('scss.js');
			return '';
		}
	},
	exportPath: function (path) {
		return path.split('.scss')[0] + ".css";
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		// Callback hooks & stop processing if needed
		const hookResponse = await tired.private.activateHook("html", "scss", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (hookResponse.continue === false) return {};

		if (node.attributes.raw === undefined) contents = await module.exports.minify(contents);
		
		if(contents.length != 0) node.replaceWith(`<style>${contents}</style>`);
		else node.replaceWith("");

		return {};
	}
}