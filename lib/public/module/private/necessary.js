// Get the required <head> scripts for every private library that was executed 
module.exports.processLibrary = async function (library, document) {
	const necessaryScripts = {
		pre: [],
		post: []
	};
	for (const libKey in library) {
		const organization = library[libKey];

		for (const orgKey in organization) {
			const modules = organization[orgKey].modules;

			for (const moduleKey in modules) {
				const module = modules[moduleKey];
				if (0 < module.executions) {
					if(module.require.prescripts) for (const script of module.require.prescripts) if (!necessaryScripts.pre.includes(script)) necessaryScripts.pre.push(script);
					if(module.require.postscripts) for (const script of module.require.postscripts) if (!necessaryScripts.post.includes(script)) necessaryScripts.post.push(script);
				}
			}
		}
	}

	// Create a new array where [ string-values, lowest-z-index ]
	necessaryScripts.pre.sort((a, b) => {
		// If we're not an array move it last
		if (!Array.isArray(b)) return -1;
		else if (a[1] > b[1]) return -1; // zIndex of script
	})
	necessaryScripts.pre.reverse();

	// Sort the post
	necessaryScripts.post.sort((a, b) => {
		// If we're not an array move it last
		if (!Array.isArray(b)) return -1;
		else if (a[1] > b[1]) return -1; // zIndex of script
	})
	necessaryScripts.post.reverse();

	// Create a minified string of all of the required <head> scripts
	let nestedHeadScripts = "";
	for (let necessaryScriptPath of necessaryScripts.pre) {
		if (Array.isArray(necessaryScriptPath)) necessaryScriptPath = necessaryScriptPath[0];
		nestedHeadScripts += await tired.help.link.read(necessaryScriptPath, {}, true) + "\n";
	}

	// Prepend scripts to head
	document.querySelector("head").insertAdjacentHTML('afterbegin', `<script>window.tired={on:{}};${nestedHeadScripts}</script>`);


	let nestedFooterScripts = "";
	for (let necessaryScriptPath of necessaryScripts.post) {
		if (Array.isArray(necessaryScriptPath)) necessaryScriptPath = necessaryScriptPath[0];
		nestedFooterScripts += await tired.help.link.read(necessaryScriptPath, {}, true) + "\n";
	}
	
	document.querySelector("body").insertAdjacentHTML('beforeend', `<script>${nestedFooterScripts}</script>`);
}