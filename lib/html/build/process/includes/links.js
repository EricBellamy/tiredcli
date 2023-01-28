const includeLinks = {
	'html': tired.root.require('lib/html/build/process/includes/links/html.js'),

	'css': tired.root.require('lib/html/build/process/includes/links/css.js'),
	'js': tired.root.require('lib/html/build/process/includes/links/javascript.js'),

	'svg': tired.root.require('/lib/html/build/process/includes/links/svg.js'),
};

module.exports = includeLinks;