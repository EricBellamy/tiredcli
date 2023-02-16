{/* <picture>
    <source media="(min-width: 45em)" srcset="large.jpg" />
    <source media="(min-width: 18em)" srcset="med.jpg" />
    <source src="small.jpg" />
    <img src="small.jpg" alt="Photo of a turboencabulator" loading="lazy" />
</picture> */}
module.exports = {
	process: async function (template, node, contents, file_key) {
		const hookResponse = await tired.private.activateHook("html", "picture", "start", template, node, contents, file_key);
		if (hookResponse.continue === false) return {};

		node.replaceWith("");

		return {};
	}
}