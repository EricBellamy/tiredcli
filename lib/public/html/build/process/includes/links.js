const includeLinks = {
	'html': tired.root.require('lib/public/html/build/process/includes/links/html.js'),

	'css': tired.root.require('lib/public/html/build/process/includes/links/css.js'),
	'js': tired.root.require('lib/public/html/build/process/includes/links/javascript.js'),

	'scss': tired.root.require('lib/public/html/build/process/includes/links/scss.js'),
	'svg': tired.root.require('/lib/public/html/build/process/includes/links/svg.js'),

	'ico': tired.root.require('/lib/public/html/build/process/includes/links/ico.js'),
};

const pictureTypes = ['png', 'jpg', 'jpeg'];
const includeLinksPicture = tired.root.require('/lib/public/html/build/process/includes/links/picture.js');
for(const pictureType of pictureTypes) includeLinks[pictureType] = includeLinksPicture;

module.exports = includeLinks;
module.exports.isPicture = function(src){
	return pictureTypes.indexOf(tired.help.getFileType(src)) != -1;
}