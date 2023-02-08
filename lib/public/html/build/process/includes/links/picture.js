{/* <picture>
    <source media="(min-width: 45em)" srcset="large.jpg" />
    <source media="(min-width: 18em)" srcset="med.jpg" />
    <source src="small.jpg" />
    <img src="small.jpg" alt="Photo of a turboencabulator" loading="lazy" />
</picture> */}
module.exports = {
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		console.log("image :: " + node.attributes.src);
		node.setAttribute('lazy', '');
		const shouldContinue = await global.HTMLDEV_PRIVATE.activateHook("picture", "start", template, node, contents, FILE_PATH, PARENT_PATH);
		if (!shouldContinue) return {};

		node.replaceWith("");

		await global.HTMLDEV_PRIVATE.activateHook("picture", "finish", template, node, contents, FILE_PATH, PARENT_PATH);

		return {};
	}
}