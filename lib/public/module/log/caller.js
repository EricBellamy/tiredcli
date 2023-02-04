// This file throws an error and checks the stack to find the calling file
// depth = 3 --> The file above the file calling this function
module.exports = function (depth = 3) {
	let e = new Error();
	let frame = e.stack.split('\n')[depth]; // change to 3 for grandparent func
	let callingFile = frame.split(':')[0];

	return callingFile.substring(callingFile.indexOf('/'));
}
module.exports.THIS = 2;
module.exports.PARENT = 3;