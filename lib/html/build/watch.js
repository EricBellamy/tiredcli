const fs = require('fs-extra');
const queue = [];
// const queue = ['pages/about.html'];

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
		existing[filename] = fs.lstatSync(filename).mtime.getTime();
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
function processWatch(watchCallback) {
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

	// Run the watch callback
	watchCallback(changedFiles, function () {
		// Save the finished watch
		tired.html.files.saveJson("watch.json", currentWatch);

		// If during the build, files were changed, process again immediately
		if (queue.length != 0) processWatch(watchCallback);
		else tired.html.status = false;
	});
}

const watchDelay = 100;
module.exports = function (watchCallback) {
	const processFunc = tired.help.debounce(processWatch.bind(null, watchCallback), watchDelay);

	fs.watch('.', {
		recursive: true
	}, (eventType, filename) => {
		// Non .tired file was modified
		const pathParts = filename.split('/');
		if (pathParts[0] != tired.location.folder) {

			if (!queue.includes(filename)) queue.push(filename);

			// Process if not already processing
			if (tired.html.status === false) processFunc();

		}
	});
	processFunc();
}