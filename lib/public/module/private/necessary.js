// Get the required <head> scripts for every private library that was executed 
module.exports.processLibrary = async function (library, document) {
	const necessaryScripts = [];
	for (const libKey in library) {
		const organization = library[libKey];

		for (const orgKey in organization) {
			const modules = organization[orgKey].modules;

			for (const moduleKey in modules) {
				const module = modules[moduleKey];
				if (0 < module.executions) {
					const moduleScripts = module.require.scripts;
					for (const script of moduleScripts) if (!necessaryScripts.includes(script)) necessaryScripts.push(script);
				}
			}
		}
	}

	// Create a new array where [ string-values, lowest-z-index ]
	necessaryScripts.sort((a, b) => {
		// If we're not an array move it last
		if (!Array.isArray(b)) return -1;
		else if (a[1] > b[1]) return -1; // zIndex of script
	})
	necessaryScripts.reverse();

	// Create a minified string of all of the required <head> scripts
	let nestedHeadScripts = "";
	for (let necessaryScriptPath of necessaryScripts) {
		if (Array.isArray(necessaryScriptPath)) necessaryScriptPath = necessaryScriptPath[0];
		nestedHeadScripts += await tired.help.link.read(necessaryScriptPath, {}, true) + "\n";
	}

	// Prepend scripts to head
	const headElement = document.querySelector("head");
	headElement.innerHTML = `<script>window.tired={on:{}};${nestedHeadScripts}</script>` + headElement.innerHTML;
}