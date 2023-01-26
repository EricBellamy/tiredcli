const path = require('path');
module.exports = function (src) {
	const ext = path.extname(src);
	return ext.substring(1); // noDotExt
}
module.exports.raw = function(src){
	return path.extname(src); // dotExt
}