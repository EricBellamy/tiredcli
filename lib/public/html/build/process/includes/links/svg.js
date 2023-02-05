const svgo = require('svgo');

module.exports = {
	load: true, // Loads the file before process
	afterHtmlValidation: true,
	compile: async function(contents){
		return await svgo.optimize(contents).data;
	},
	process: async function (template, node, contents, lazymanager, FILE_PATH, PARENT_PATH) {
		if(node.attributes.inline != undefined){
			// Inline it in the HTML
			node.replaceWith(contents);
		} else {
			node.setAttribute('lazy', '');
			const hookResponse = await tired.private.activateHook("html", "svg", "start", template, node, contents, FILE_PATH, PARENT_PATH);
			if (hookResponse.continue === false) return;

			node.replaceWith("");
		}
	}
}