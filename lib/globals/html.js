global.tired.html = {};
global.tired.html.status = false;

global.tired.html.files = {};
global.tired.html.files.saveJson = function(name, data){ global.tired.files.saveJson(`html/${name}`, data); }
global.tired.html.files.read = function(name){ return global.tired.files.read(`html/${name}`); }