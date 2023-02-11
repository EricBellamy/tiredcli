const getFileType = tired.root.require('lib/public/module/files/getFileType.js');
module.exports = function (src, prepend = '', append = '', newFileType = '') {
	let fileType = getFileType.raw(src);
	let filePath = src.split(fileType)[0];
	let filename;

	// If we have a slash in the path, we need to get the filename
	if(filePath.lastIndexOf('/') !== -1) {
		filename = filePath.substring(filePath.lastIndexOf("/") + 1);
		filePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);
	} else { // No slash
		filename = filePath;
		filePath = '';
	}
	if(0 < newFileType.length) fileType = newFileType;
	
	return `${filePath}${prepend}${filename}${append}${fileType}`;
}