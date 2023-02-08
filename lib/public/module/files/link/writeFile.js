const fs = require('fs-extra');
const links = tired.root.require('lib/public/html/build/process/includes/links.js');

module.exports = async function (FILE_PATH, EXPORT_FOLDER_BASE_PATH = 'export', shouldMinify = false) {
	let filetype = tired.help.getFileType(FILE_PATH);
	const filePathBase = `include/${filetype}/`;

	// Allow for include paths such as "test.css" instead of "include/css/test.css"
	if (FILE_PATH.indexOf("include/") != 0 || FILE_PATH.split("/").length < 2) FILE_PATH = `include/${filetype}/${FILE_PATH}`;

	// Create & read input path
	const inputFilePath = `${tired.location.working}/${FILE_PATH}`;

	const contents = await tired.help.link.read(inputFilePath, shouldMinify);

	// Check if the file type has an export path modifier
	if (links[filetype] && links[filetype].exportPath) {
		FILE_PATH = links[filetype].exportPath(FILE_PATH);
		filetype = tired.help.getFileType(FILE_PATH);
	}

	// Get the base folder of the file being exported
	let FILE_NAME = FILE_PATH.substring(FILE_PATH.lastIndexOf('/') + 1);
	let RELATIVE_FILE_PATH = FILE_PATH.substring(filePathBase.length); // "include/css/test.css" -> "test.css
	let FILE_FOLDER = RELATIVE_FILE_PATH.indexOf('/') != -1 ? RELATIVE_FILE_PATH.substring(0, RELATIVE_FILE_PATH.lastIndexOf('/') + 1) : '';

	// Create the export file folder path
	const exportFileFolderPath = `${tired.location.working}/${tired.location.folder}/${tired.html.folder}/dist/${EXPORT_FOLDER_BASE_PATH}/${filetype}/${FILE_FOLDER}`;
	const exportFilePath = `${exportFileFolderPath}${FILE_NAME}`;

	// Create the export file
	fs.ensureDirSync(exportFileFolderPath)
	fs.writeFileSync(exportFilePath, contents);

	return {
		absolute: exportFilePath,
		relative: `${EXPORT_FOLDER_BASE_PATH}/${filetype}/${FILE_FOLDER}${FILE_NAME}`
	};
}


module.exports.absolute = async function (ABSOLUTE_PATH, EXPORT_PATH, shouldMinify = false) {
	let filetype = tired.help.getFileType(ABSOLUTE_PATH);

	try {
		const contents = await tired.help.link.read(ABSOLUTE_PATH, shouldMinify);

		// Check if the file type has an export path modifier
		if (links[filetype] && links[filetype].exportPath) {
			ABSOLUTE_PATH = links[filetype].exportPath(ABSOLUTE_PATH);
			filetype = tired.help.getFileType(ABSOLUTE_PATH);
		}

		// Get the base folder of the file being exported
		const EXPORT_FOLDER = EXPORT_PATH.substring(0, EXPORT_PATH.lastIndexOf('/'));

		// Create the export file
		fs.ensureDirSync(EXPORT_FOLDER)
		fs.writeFileSync(EXPORT_PATH, contents);

		return true;
	} catch (err) {
		return err.message;
	}
}