const path = require('path');

global.__tired_root = path.join(__dirname + "/..");
global.tiredRequire = function (requirePath) { return require(global.__tired_root + "/" + requirePath); }

module.exports.load = function(name){
	return require(`./globals/${name}`);
}