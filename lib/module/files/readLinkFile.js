const fs = require('fs-extra');
const includeLinks = tired.root.require('lib/html/build/process/includes/links.js');

module.exports = async function (FILE_PATH, attributes = {}, minify = true) {
	const filetype = tired.help.getFileType(FILE_PATH);
	const link = includeLinks[filetype];

	if (link === undefined) {
		tired.log.color(['red', `[readAndProcessFile.js] Unsupported link type `],
			['magenta', filetype],
			['red', ` called from file `],
			['magenta', tired.help.caller()]);
		return false;
	}

	// Get the contennts
	let contents = fs.readFileSync(FILE_PATH, link.encoding);
	if(link.onload) contents = await link.onload(contents, attributes);

	if (minify && link.minify) return link.minify(contents);
	else return contents;
};