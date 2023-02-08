const path = require('path');
module.exports = function (src) {
	if (tired.cache.data.has('files/getFileType.js/base', src)) return tired.cache.data.get('files/getFileType.js/base', src);
	return tired.cache.data.set('files/getFileType.js/base', src, path.extname(src).substring(1)); // no dot ext -> "css"
}
module.exports.raw = function (src) {
	if (tired.cache.data.has('files/getFileType.js/raw', src)) return tired.cache.data.get('files/getFileType.js/raw', src);
	return tired.cache.data.set('files/getFileType.js/raw', src, path.extname(src)); // dot ext -> ".css"
}