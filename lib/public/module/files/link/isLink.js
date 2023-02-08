const links = tired.root.require('lib/public/html/build/process/includes/links.js');
module.exports = function(src){
	const filetype = tired.help.getFileType(src);
	return links[filetype] != undefined;
}