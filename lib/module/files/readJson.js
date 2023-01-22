module.exports = function (filename, throwError = true) {
	let readFile = {};
	try {
		readFile = JSON.parse(fs.readFileSync(filename));
	} catch (err) {
		if (throwError) throw new Error(`Error reading JSON file: ${filename}`);
		readFile = {};
	};
	return readFile;
}