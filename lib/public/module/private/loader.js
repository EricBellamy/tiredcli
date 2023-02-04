module.exports = {
	libraries: {},
	load: async function (type) {
		// Read the files in the type directory
		const typeFolderKeys = tired.root.files.readDirs(`lib/private/${type}`, [], false, '');

		// If there are no folders, return
		if (Object.keys(typeFolderKeys).length === 0) return;

		// Load the libraries
		if (this.libraries[type] === undefined) this.libraries[type] = {};
		for (const typeFolderKey in typeFolderKeys) {
			if(this.libraries[type][typeFolderKey] === undefined) this.libraries[type][typeFolderKey] = {};
			
			// Organizational folders inside of the base types ("html" -> "tired")
			const orgFolderKeys = tired.root.files.readDirs(`lib/private/${type}/${typeFolderKey}`, [], false, '');
			for (const orgFolderKey in orgFolderKeys) {

				const projectFolderBaseFiles = tired.root.files.readDirFiles.forType(`lib/private/${type}/${typeFolderKey}/${orgFolderKey}`, 'js', true, '');

				for (const baseFileKey in projectFolderBaseFiles) {

					// Load the file and do a basic check for a module.exports && module.exports[type] initializer
					let baseFileContents = await tired.root.files.readText(`lib/private/${type}/${typeFolderKey}/${orgFolderKey}/${baseFileKey}`);
					if (baseFileContents.indexOf('module.exports') != -1 && baseFileContents.substring(baseFileContents.indexOf('module.exports')).indexOf(`${type}:`) != -1) {

						// Load this module here
						const baseFile = tired.help.requireFromString(baseFileContents);

						// Double check that this is a proper library module
						if (baseFile && baseFile[type] != undefined) {
							if (this.libraries[type][typeFolderKey][orgFolderKey] === undefined) this.libraries[type][typeFolderKey][orgFolderKey] = {
								modules: {},
							}

							// Set the main key
							if (this.libraries[type][typeFolderKey][orgFolderKey].main === undefined || (baseFileKey === 'index.js' || baseFileKey === 'main.js')) this.libraries[type][typeFolderKey][orgFolderKey].main = baseFileKey;

							// Set the module
							this.libraries[type][typeFolderKey][orgFolderKey].modules[baseFileKey] = {
								key: baseFileKey,
								require: baseFile,
								executions: 0
							}
						}
					}
				}
			}
		}
	},
	// Now init the private libraries
	init: async function (group) {
		const orgs = this.libraries[group];

		for(const orgKey in orgs){
			const libraries = orgs[orgKey];
	
			for (const libraryKey in libraries) {
				const modules = libraries[libraryKey].modules;
				for (const moduleKey in modules) {
					if (modules[moduleKey].require[group] !== undefined) await modules[moduleKey].require[group]();
				}
			}
		}
	},
	hooks: {
		// "html:css:before": [[function(){}, "filePath"]]
	},
	files: {},
	resetHookExecutions: function (group) {
		const libraries = this.libraries[group];

		for (const libraryKey in libraries) {
			const modules = libraries[libraryKey].modules;
			for (const moduleKey in modules) modules[moduleKey].executions = 0;
		}
	},
	registerHook: async function (group, hook_type, hook_key, callback) {
		// Get the filePath of the function calling this function
		const file_id = tired.help.caller(tired.help.caller.PARENT);

		const hook_id = group + ':' + hook_type + ':' + hook_key;
		if (this.hooks[hook_id] === undefined) this.hooks[hook_id] = [];
		this.hooks[hook_id].push([callback, hook_id, file_id]);
	},
	activateHook: async function (group, hook_type, hook_key, ...params) {
		// Activate all of the registered hooks for this action
		const hook_id = group + ':' + hook_type + ':' + hook_key;
		const availableCallbacks = this.hooks[hook_id];

		let shouldContinue = true;
		if (availableCallbacks != undefined) {
			for (const callback of availableCallbacks) {
				const callbackReturn = await callback[0](...params);

				// if callbackReturn is an object
				if (typeof callbackReturn === 'object') {
					shouldContinue = callbackReturn.continue != false ? true : false;

					this.hooks[callback[1]].executions++;
				} else {
					tired.log.color(['red', '[PRIVATE] :: Invalid hook response "'],
						['magenta', callbackReturn],
						['red', '" in hook "'],
						['magenta', hook_type],
						['red', '" "'],
						['magenta', hook_key],
						['red', '" registered from "'],
						['magenta', callback[2]],
						['red', '"']);
				}
			}
		}

		return shouldContinue;
	}
}