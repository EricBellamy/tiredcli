const fs = require('fs-extra');
const links = tired.root.require('lib/public/html/build/process/includes/links.js');

module.exports = async function (FILE_PATH, EXPORT_FOLDER_BASE_PATH = 'export', shouldMinify = false) {
	let filetype = tired.help.getFileType(FILE_PATH);

	// Create & read input path
	const inputFilePath = `${process.cwd()}/include/${filetype}/${FILE_PATH}`;
	const contents = await tired.help.readLinkFile(inputFilePath, shouldMinify);

	// Check if the file type has an export path modifier
	if(links[filetype] && links[filetype].exportPath) {
		FILE_PATH = links[filetype].exportPath(FILE_PATH);
		filetype = tired.help.getFileType(FILE_PATH);
	}

	// Get the base folder of the file being exported
	let FILE_NAME = FILE_PATH.substring(FILE_PATH.lastIndexOf('/') + 1);
	let FILE_FOLDER = FILE_PATH.indexOf('/') != -1 ? FILE_PATH.substring(0, FILE_PATH.lastIndexOf('/') + 1) : '';

	// Create the export file folder path
	const exportFileFolderPath = `${process.cwd()}/${tired.location.folder}/${tired.html.folder}/dist/${EXPORT_FOLDER_BASE_PATH}/${filetype}/${FILE_FOLDER}`;
	const exportFilePath = `${exportFileFolderPath}${FILE_NAME}`;

	// Create the export file
	fs.ensureDirSync(exportFileFolderPath)
	fs.writeFileSync(exportFilePath, 'testing');

	return exportFilePath;
}