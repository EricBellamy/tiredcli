const fs = require('fs-extra');
const path = require('path');

const GLOBAL_IGNORE = ['.DS_Store', '.git', 'node_modules'];

function READ_DIRS(CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH, FILES = {}) {
	if (RELATIVE_PATH === undefined) RELATIVE_PATH = CURRENT_PATH;

	try {
		const items = fs.readdirSync(CURRENT_PATH);
		for (const item of items) {
			if (GLOBAL_IGNORE.indexOf(item) === -1 && IGNORE.indexOf(item) === -1) {
				const ITEM_PATH = path.join(CURRENT_PATH, item);
				let RELATIVE_ITEM_PATH = `${RELATIVE_PATH}/${item}`;
				if (RELATIVE_ITEM_PATH[0] === "/") RELATIVE_ITEM_PATH = RELATIVE_ITEM_PATH.substr(1);

				const stat = fs.statSync(ITEM_PATH);
				if (stat.isDirectory()) {
					FILES[RELATIVE_ITEM_PATH] = {
						modified: stat.mtimeMs,
					}
					if (SEARCH_FOLDERS) READ_DIRS(ITEM_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_ITEM_PATH, FILES);
				}
			}
		}
	} catch (err) {
		console.log(err);
	}
	return FILES;
}

module.exports = READ_DIRS;