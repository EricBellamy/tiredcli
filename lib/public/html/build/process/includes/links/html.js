const fs = require('fs-extra');
const parser = tired.root.require('lib/public/module/html/parser.js');

function fillDataVariables(HTML_STRING, data, variableName, variableValue) {
	// Match all instances of { variableName.valueName }
	if(variableName && variableValue) {
		const variableMatches = parser.findVariableMatches(HTML_STRING, variableName);
		for(const match of variableMatches) HTML_STRING = HTML_STRING.replace(match.matched, variableValue[match.value] ? variableValue[match.value] : '');
	}

	// Match all references to data objects { recipe.views.last24Hours }
	const objectMatches = parser.findObjectReferences(HTML_STRING);
	for(const match of objectMatches) {
		let value = data;
		for(const part of match.parts){
			if(value[part] === undefined) {
				value = '';
				break;
			} else value = value[part];
		}
		HTML_STRING = HTML_STRING.replace(match.matched, value);
	}

	const attributeMatches = parser.findAttributes(HTML_STRING);
	for(const match of attributeMatches) HTML_STRING = HTML_STRING.replace(match.matched, data[match.value] ? data[match.value] : '');

	return HTML_STRING;
}

module.exports = {
	load: true, // Loads the file before process
	onload: async function (contents, attributes) {
		// Handle any HTML for loops
		const loops = parser.findForLoops(contents);
		for (loop of loops) {
			let finalHtml = "";
			const iterables = attributes[loop.iterable];
			if(iterables != undefined) for (const iterable of iterables) finalHtml += fillDataVariables(loop.content, attributes, loop.variable, iterable);
			contents = contents.replace(loop.matched, finalHtml);
		}

		// Fill in all regular variables
		contents = fillDataVariables(contents, attributes)

		return contents;
	},
	encoding: 'utf8',
	process: async function (template, node, contents) {
		const dataFilledHtml = fillDataVariables(contents, node.attributes);

		let replaceWith = dataFilledHtml;
		if(node.innerHTML.length != 0){
			replaceWith = tired.html.help.HTMLParser.parse(replaceWith);
			let inside = replaceWith;
			while(inside.childNodes.length != 0) {
				const children = inside.childNodes;

				let hadNonTextChild = false;
				for(let a = 0; a < children.length; a++){
					if(children[a].nodeType != 3 && children[a].rawTagName != 'include') {
						inside = children[a];
						hadNonTextChild = true;
						break;
					}
				}
				if(!hadNonTextChild) break;
			}
			inside.innerHTML = node.innerHTML;
		}

		node.replaceWith(replaceWith);
		
		return {};
	}
}