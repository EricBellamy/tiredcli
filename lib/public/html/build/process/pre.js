const fs = require('fs-extra');
const links = require('./includes/links.js');

const loaded = {
	status: false,
	files: {
		css: {},
		js: {}
	},
	css: "",
	js: ""
};
async function loadDefaults(htmlTag) {
	if (loaded.status === false) {
		loaded.status = true;

		const fileBase = 'lib/public/html/build/process/pre';
		const cssFiles = tired.root.files.readDirFiles.forType(fileBase + '/css', 'css', true, '');
		const jsFiles = tired.root.files.readDirFiles.forType(fileBase + '/js', 'js', true, '');

		for (const file_path in cssFiles) loaded.css += `<style>${await tired.help.link.read(`${tired.location.root}/${fileBase}/css/${file_path}`)}</style>`;
		for (const file_path in jsFiles) loaded.js += `<script>${await tired.help.link.read(`${tired.location.root}/${fileBase}/js/${file_path}`)}</script>`;
	}

	// Add default CSS & JS
	htmlTag.querySelector('head').insertAdjacentHTML('afterbegin', loaded.css + loaded.js);
}

// Check if we're missing a wrapping body tag, validate the html
module.exports = async function (document, FILE_PATH) {
	let filename = FILE_PATH.substring(FILE_PATH.lastIndexOf('/') + 1);
	filename = filename.split('.')[0];

	tired.log.color.start('pre.js');

	// Fix missing <html> tag
	if (document.querySelector('html') === null) {
		document.innerHTML = '<!DOCTYPE html><html lang="en">' + document.innerHTML + '</html>';

		tired.log.color('pre.js', ['yellow', 'Fixed missing <html> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	const htmlTag = document.querySelector('html');
	// Fix nested DOCTYPE in fixed <html> tag
	if (htmlTag.innerHTML.indexOf('<!DOCTYPE html>') === 0) {
		htmlTag.innerHTML = htmlTag.innerHTML.substring('<!DOCTYPE html>'.length);

		tired.log.color('pre.js', ['yellow', 'Fixed missing <!DOCTYPE html> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing <head> tag
	let htmlHead = htmlTag.querySelector('head');
	if (htmlHead === null) {
		htmlTag.insertAdjacentHTML('afterbegin', `<head><title>${filename}</title></head>`);
		htmlHead = htmlTag.querySelector('head')

		tired.log.color('pre.js', ['yellow', 'Fixed missing <head> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	// Add default CSS & JS
	await loadDefaults(htmlTag);

	// Fix missing <body> tag
	if (document.querySelector('body') === null) {
		const newBodyTag = tired.html.help.HTMLParser.parse('<body></body>');
		for (const childNode of htmlTag.childNodes) {
			if (childNode.rawTagName != 'head') {
				childNode.parentNode.removeChild();
				newBodyTag.querySelector('body').appendChild(childNode);
			}
		}
		htmlTag.appendChild(newBodyTag);

		tired.log.color('pre.js', ['yellow', 'Fixed missing <body> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing title tag inside of <head>
	if (htmlTag.querySelector('head title') === null) {
		htmlHead.insertAdjacentHTML('afterbegin', `<title>${filename}</title>`);

		tired.log.color('pre.js', ['yellow', 'Fixed missing <title> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing <meta name="description" content="Free Web tutorials"> tag inside of <head>
	if (htmlTag.querySelector('head meta[name="description"]') === null) {
		htmlHead.insertAdjacentHTML('afterbegin', `<meta name="description" content="${filename}">`);

		tired.log.color('pre.js', ['yellow', 'Fixed missing <meta name="description"> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing <viewport> tag inside of <head>
	if (htmlTag.querySelector('head meta[name="viewport"]') === null) {
		htmlHead.insertAdjacentHTML('afterbegin', `<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0">`);

		tired.log.color('pre.js', ['yellow', 'Fixed missing <viewport> tag for "'],
			['magenta', FILE_PATH],
			['yellow', '"']);
	}

	tired.log.color.stop('pre.js');

	return document;
}