const fs = require('fs-extra');
const isLink = tired.root.require('lib/public/module/files/link/isLink.js')

module.exports = {
	includes: async function (included = []) {
		for (const includePath of included) {
			const needsUpdating = tired.help.link.needsUpdating(includePath);
			if (needsUpdating) await tired.help.link.write(includePath, 'include', true);
		}
	},
	exportFolder: async function () {
		tired.log.color.start('exporter.js/exportFolder');

		const exportFiles = tired.working.files.readDirFiles('export', [], true, '/');
		for (const path in exportFiles) {
			const inputPath = tired.location.working + "/export/" + path;
			const exportPath = `${tired.location.working}/.tired/html/dist/export/${path}`;

			const needsUpdating = tired.help.link.needsUpdating.absolute(inputPath, exportPath);
			if (needsUpdating) {
				let exportedLink = true;
				const isLinkFile = isLink(path);

				// Write any link file types
				if (isLinkFile) exportedLink = await tired.help.link.write.absolute(inputPath, exportPath, true);

				// The link write returned an err.message
				if (exportedLink != true) {
					tired.log.color('exporter.js/exportFolder', ['yellow', 'Export failed "'],
						['magenta', exportedLink],
						['yellow', '" for file "'],
						['magenta', path],
						['yellow', '"']);
				}

				// Copy non-link files, or error link files
				if (!isLinkFile || exportedLink != true) {
					const exportFolder = exportPath.substring(0, exportPath.lastIndexOf('/'));
					fs.ensureDirSync(exportFolder);
					fs.copyFileSync(inputPath, exportPath);
				}
			}
		}

		tired.log.color.stop('exporter.js/exportFolder');
	}
}