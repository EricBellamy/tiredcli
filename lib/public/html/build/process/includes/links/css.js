const minifyCSS = new (require('clean-css'));
const stylelint = require('stylelint');
const config = require('stylelint-config-standard');
config.rules.indentation = false;
config.rules['no-missing-end-of-source-newline'] = false;
config.rules['rule-empty-line-before'] = false;
config.rules['block-closing-brace-newline-before'] = false;

module.exports = {
	load: true, // Loads the file before process
	encoding: 'utf8',
	minify: async function (contents) {
		return await minifyCSS.minify(contents).styles;
	},
	validate: async function (contents, FILE_PATH, PARENT_PATH) {
		const lint = await stylelint.lint({
			code: contents,
			config: { rules: config.rules }
		});
		const result = lint.results[0];
		const errors = [];
		for (const warning of result.warnings) {
			const warningText = warning.text.split(`(${warning.rule})`);
			errors.push([
				['red', `[CSS Validation] ${warningText[0].trim()} (`],
				['magenta', warning.rule],
				['red', ') ['],
				['magenta', warning.line],
				['red', ':'],
				['magenta', warning.column],
				['red', '] in file "'],
				['magenta', FILE_PATH],
				['red', '" within "'],
				['magenta', PARENT_PATH],
				['red', '"'],
			]);
		}
		return errors;
	},
	process: async function (template, node, contents, FILE_PATH, PARENT_PATH) {
		const errors = module.exports.validate(contents);

		if (0 < errors.length) {
			node.replaceWith('');
			return errors;
		} else {
			// Callback hooks & stop processing if needed
			const shouldContinue = await global.HTMLDEV_PRIVATE.activateHook("css", "start", template, node, contents, FILE_PATH, PARENT_PATH);
			if (!shouldContinue) return;

			// Minify if needed & insert
			let minifyResult = contents;
			if (node.attributes.raw === undefined) minifyResult = await module.exports.minify(contents);
			node.replaceWith(`<style>${minifyResult}</style>`);

			await global.HTMLDEV_PRIVATE.activateHook("css", "finish", template, node, contents, FILE_PATH, PARENT_PATH);

			return;
		}
	}
}