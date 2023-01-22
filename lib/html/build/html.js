module.exports = {
	getIncludes: function(FILE_PATH){
		const RELATIVE_FILE_PATH = FILE_PATH.split(process.cwd())[1].substring(1);
		console.log(RELATIVE_FILE_PATH);
		console.log(global.tired.working.files.readText(RELATIVE_FILE_PATH));

		return [,];
	}
}