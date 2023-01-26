const fs = require('fs-extra');
const path = require('path');

module.exports = function READ_DIR_FILES(CURRENT_PATH, IGNORE = [], SEARCH_FOLDERS = true, RELATIVE_PATH, FILES = {}) {
	if (RELATIVE_PATH === undefined) RELATIVE_PATH = CURRENT_PATH;

	try {
		const items = fs.readdirSync(CURRENT_PATH);
		for (const item of items) {
			if (IGNORE.indexOf(item) === -1) {
				const ITEM_PATH = path.join(CURRENT_PATH, item);
				let RELATIVE_ITEM_PATH = `${RELATIVE_PATH}/${item}`;
				if (RELATIVE_ITEM_PATH[0] === "/") RELATIVE_ITEM_PATH = RELATIVE_ITEM_PATH.substr(1);

				const stat = fs.statSync(ITEM_PATH);
				if (stat.isDirectory()) {
					if (SEARCH_FOLDERS) READ_DIR_FILES(ITEM_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_ITEM_PATH, FILES);
				} else {
					const file_type = 1 < item.split(".").length ? item.split(".")[1] : '';
					FILES[RELATIVE_ITEM_PATH] = {
						type: file_type,
						modified: stat.mtimeMs,
					}
				}
			}
		}
	} catch (err) { }
	return FILES;
};

module.exports.forType = function (CURRENT_PATH, FILE_TYPE = "", SEARCH_FOLDERS = true, RELATIVE_PATH, FILES = {}) {
	if (RELATIVE_PATH === undefined) RELATIVE_PATH = CURRENT_PATH;

	try {
		const items = fs.readdirSync(CURRENT_PATH);
		for (const item of items) {
			const ITEM_PATH = path.join(CURRENT_PATH, item);
			let RELATIVE_ITEM_PATH = path.join(RELATIVE_PATH, item);
			if (RELATIVE_ITEM_PATH[0] === "/") RELATIVE_ITEM_PATH = RELATIVE_ITEM_PATH.substr(1);

			const stat = fs.statSync(ITEM_PATH);
			if (stat.isDirectory()) {
				if (SEARCH_FOLDERS) READ_DIR_FILES(ITEM_PATH, IGNORE, SEARCH_FOLDERS, RELATIVE_ITEM_PATH, FILES);
			} else {
				const file_type = 1 < item.split(".").length ? item.split(".")[1] : '';
				if (file_type === FILE_TYPE) {
					FILES[RELATIVE_ITEM_PATH] = {
						type: file_type,
						modified: stat.mtimeMs,
					}
				}
			}
		}
	} catch (err) { }
	return FILES;
}