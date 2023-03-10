const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// The changed file queue
const queue = [];

// Loads the last watch file
function getLastWatch() {
	let watchFile;
	try {
		watchFile = JSON.parse(tired.html.files.read("watch.json").toString());
		for (key in watchFile) watchFile[key] = parseInt(watchFile[key]);
	} catch (err) {
		watchFile = {};
	}
	return watchFile;
}

// Updates the modified dates for an existing watch file
function getModifiedDates(fileQueue, existing = {}) {
	for (const filename of fileQueue) {
		try {
			existing[filename] = fs.lstatSync(filename).mtime.getTime();
		} catch(err){}
	}
	return existing;
}

// Creates an array of file paths that have been changed
function getChangedFiles(last, current) {
	const changedFiles = [];
	for (const filename in current) {
		if (last[filename] != current[filename]) {
			changedFiles.push(filename);
		}
	}
	return changedFiles;
}

// Process the watch command
async function processWatch(watchCallback) {
	tired.html.status = "watching";

	// Create a reference free copy of the queue
	// For loop with includes check incase of rare async push issue
	const fileQueue = [];
	for (let a = 0; a < queue.length; a++) {
		if (!fileQueue.includes(queue[a])) {
			fileQueue.push(queue[a]);
			queue.splice(a, 1);
			a--;
		}
	}

	// Create the watch objects
	const lastWatch = getLastWatch();
	const currentWatch = getModifiedDates(fileQueue, tired.help.clone(lastWatch));

	// Get changed files
	const changedFiles = getChangedFiles(lastWatch, currentWatch);

	// Save file sizes on watch trigger to cache because of files that get saved as we're building
	for (const changedPath of changedFiles) tired.cache.data.set('filesize', changedPath, tired.help.filesize(changedPath));

	if(0 < tired.watch.ignore.length){
		for(let a = 0; a < changedFiles.length; a++){
			if(tired.watch.ignore.includes(changedFiles[a])){
				changedFiles.splice(a, 1);
				a--;
			}
		}
		tired.watch.ignore = [];
		if(changedFiles.length === 0) {
			tired.html.status = false;
			return; // Return if there's nothing left
		}
	}

	// Run the watch callback
	watchCallback(changedFiles, async function () {

		// Save the finished watch
		tired.html.files.saveJson("watch.json", currentWatch);

		// If during the build, files were changed, process again immediately
		if (queue.length != 0) return await processWatch(watchCallback);
		else tired.html.status = false;

		// Trigger the live reload
		if(tired.HOST_CONFIG.server.url) axios(`${tired.HOST_CONFIG.server.url}/__lightserver__/trigger`)
	});
}

const chokidar = require('chokidar');

const watchDelay = 500;
module.exports = function (watchCallback) {
	const processFunc = tired.help.debounce(processWatch.bind(null, watchCallback), watchDelay);

	// One-liner for current directory
	const watcher = chokidar.watch('.', {
		ignored: [tired.location.folder, '**node_modules', '**.git', '**.DS_Store', '**.lock'], // ignore dotfiles
		persistent: true
	});
	watcher.on('all', (event, filepath) => {
		const fileExt = path.extname(filepath);
		// Actually a file
		if (fileExt.length != 0) {
			// Not a locked file

			// Non .tired file was modified
			if (!queue.includes(filepath)) queue.push(filepath);

			// Process if not already processing
			if (tired.html.status === false) processFunc();
		}
	});
}