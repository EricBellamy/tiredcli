module.exports = {
	load: true, // Loads the file before process
	process: async function (template, node, contents, lazymanager, FILE_PATH, PARENT_PATH) {
		const passedAttributes = tired.html.attributes.format(node.attributes, 'src');
		node.replaceWith(`<link rel="icon" type="image/x-icon" ${passedAttributes} href="${tired.html.help.formatIncludeSrc(node.attributes.src)}">`);
		return { export: true };
	}
}