// Check if we're missing a wrapping body tag, validate the html
module.exports = async function (document, FILE_PATH) {
	let filename = FILE_PATH.substring(FILE_PATH.lastIndexOf('/') + 1);
	filename = filename.split('.')[0];

	// Fix missing <html> tag
	if (document.querySelector('html') === null) {
		document.innerHTML = '<!DOCTYPE html><html>' + document.innerHTML + '</html>';

		global.tired.log.color(['yellow', '[pre.js] Fixed missing <html> tag for "'],
			['cyan', FILE_PATH],
			['yellow', '"']);
	}

	const htmlTag = document.querySelector('html');
	// Fix nested DOCTYPE in fixed <html> tag
	if (htmlTag.innerHTML.indexOf('<!DOCTYPE html>') === 0) {
		htmlTag.innerHTML = htmlTag.innerHTML.substring('<!DOCTYPE html>'.length);

		global.tired.log.color(['yellow', '[pre.js] Fixed missing <!DOCTYPE html> tag for "'],
			['cyan', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing <head> tag
	if (htmlTag.querySelector('head') === null) {
		htmlTag.insertAdjacentHTML('afterbegin', `<head><title>${filename}</title></head>`);

		global.tired.log.color(['yellow', '[pre.js] Fixed missing <head> tag for "'],
			['cyan', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing title tag inside of <head>
	if (htmlTag.querySelector('head title') === null) {
		htmlTag.querySelector('head').insertAdjacentHTML('afterbegin', `<title>${filename}</title>`);
		global.tired.log.color(['yellow', '[pre.js] Fixed missing <title> tag for "'],
			['cyan', FILE_PATH],
			['yellow', '"']);
	}

	// Fix missing <body> tag
	if (document.querySelector('body') === null) {
		const newBodyTag = global.tired.html.help.HTMLParser.parse('<body></body>');
		for (const childNode of htmlTag.childNodes) {
			if (childNode.rawTagName != 'head') {
				childNode.parentNode.removeChild();
				newBodyTag.querySelector('body').appendChild(childNode);
			}
		}
		htmlTag.appendChild(newBodyTag);

		global.tired.log.color(['yellow', '[pre.js] Fixed missing <body> tag for "'],
			['cyan', FILE_PATH],
			['yellow', '"']);
	}

	return document;
}