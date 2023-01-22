const html = global.tired.root.require("lib/html/build/html.js");

function matchChanged(pages, changed) {
	// Get an array of include srcs for each page as well as the final HTML
	for (key in pages) {
		const [includes, htmlFile] = html.getIncludes(key);
	}
}

module.exports = async function (changed = []) {
	// Build the HTML includes for all page files & get all include URLs per page file
	let LAST_BUILD = global.tired.files.readJson("build_html.json", false);
	const rootPages = global.tired.working.files.readDirFiles("", ['.DS_Store', '.git', 'node_modules'], false);
	const nestedPages = global.tired.working.files.readDirFiles(process.cwd() + '/pages', ['.DS_Store', '.git', 'node_modules']);

	matchChanged(rootPages, changed);
	// matchChanged(nestedPages, changed);

	// if(changed.length === 0){
	// 	console.log("BUILDING ALL FILES");
	// } else {
	// 	console.log("BUILDING CHANGED FILES");
	// }
}