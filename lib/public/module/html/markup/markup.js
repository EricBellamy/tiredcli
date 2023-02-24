function ProcessingError(...colorLogArgs) {
	this.name = "ProcessingError";
	this.colorLogArgs = colorLogArgs;
}
ProcessingError.prototype = Error.prototype;

const typeIf = tired.root.require("lib/public/module/html/markup/types/if.js");
const values = tired.root.require("lib/public/module/html/markup/values.js");

const special = {
	variable: {
		start: function (line) {
			// Match { SOMETHING } || { SOMETHING.NESTED } variables --> where SOMETHING is anything but a space
			const regex = /\{ *([\w.]+) *\}/;
			const match = line.match(regex);
			if (match != null && match[1] != "end") return match;
			return null;
		},
		create: function (match) {
			const variable = values.formatVariable(match[1]);
			variable.type = 'variable';
			variable.id = values.generateRandomId(8);

			return variable;
		},
		validate: function () {

		}
	},
	comment: {
		start: function (line) {
			return line.match(/<!--/);
		},
		end: function (line) {
			return line.match(/-->/);
		},
		getEndOfLine: function (line, endMatch) {
			// Re-add the starting tabs
			const startingTabs = line.match(/^\t+/);
			let endOfLine = line.substring(endMatch.index + endMatch[0].length);
			if (startingTabs != null) endOfLine = startingTabs[0] + endOfLine;

			return endOfLine;
		}
	},
	for: {
		regex: {
			start: /{ *for ([a-zA-Z0-9]+) of ([a-zA-Z0-9._-]+) *}/
		},
		start: function (line) {
			return line.match(this.regex.start);
		},
		create: function (match) {
			const firstArgument = match[1];
			let secondArgument = match[2];

			return { type: 'for', id: values.generateRandomId(8), condition: { firstValue: firstArgument, secondValue: values.formatVariable(secondArgument) }, active: {}, lines: [] };
		},
		validate: function () {

		}
	},
	if: {
		regex: {
			// start: /{[\s]*if (?!.+break\s*?\})(.*?)\s*}/,
			start: /{[\s]*if (?![^}]+break\s*?\})\s*(.*?)\s*}/
		},
		start: function (line) {
			return line.match(this.regex.start);
		},
		create: function (match) {
			const unformattedConditions = typeIf.parseArguments(match[1]);
			const ifConditions = typeIf.formatConditions(unformattedConditions);

			return { type: 'if', id: values.generateRandomId(8), condition: ifConditions, active: {}, lines: [] };
		}
	},
	break: { // { if CONDITION break }
		regex: {
			braces: /(?<=\()[^)]*(?=\))/g,
			// start: /\{ if ([^{}]*) break \}/,
			start: /\{\s*if ([^{}]*) break\s*\}/
		},
		start: function (line) {
			return line.match(this.regex.start);
		},
		create: function (match) {
			const unformattedConditions = typeIf.parseArguments(match[1]);
			const ifConditions = typeIf.formatConditions(unformattedConditions);

			return { type: 'break', id: values.generateRandomId(8), condition: ifConditions };
		},
		validate: function () {
			// Break out of the current target, set target to parent
			// If parent does not exist, stop the rendering (Main page break condition)
		},
	},
	end: {
		start: function (line) {
			return line.match(/\{\s*end\s*\}/);
		}
	}
}

const specialKeys = Object.keys(special);
function findFirstSpecialStart(line) {
	// Get all of the match indices
	const matches = {};

	// Get the match starts
	for (const specialName of specialKeys) matches[specialName] = special[specialName].start(line);

	// Find the lowest index & caseName
	let lowestIndex;
	let lowestKey;
	for (const specialKey of specialKeys) {
		if (matches[specialKey] != null && (lowestIndex === undefined || matches[specialKey].index < lowestIndex)) {
			lowestIndex = matches[specialKey].index;
			lowestKey = specialKey;
		}
	}

	// Return the lowest index match or false
	if (lowestIndex === undefined) return false;
	else return {
		type: lowestKey,
		match: matches[lowestKey]
	}
}

function getStartOfLine(line, match) {
	return line.substring(0, match.index);
}
function getEndOfLine(line, match) {
	// Re-add the starting tabs
	// const startingTabs = line.match(/^\t+/);
	let endOfLine = line.substring(match.index + match[0].length);
	// if (startingTabs != null) endOfLine = startingTabs[0] + endOfLine;

	return endOfLine;
}
function processStartOfLine(line, match, target, isEndOfLine = false) {
	pushToLine(target, getStartOfLine(line, match), isEndOfLine);
}
function processEndOfLine(line, match, target, lineEntry) {
	return processLine(
		getEndOfLine(line, match),
		target,
		lineEntry
	);
}

function processLine(line, target, lineEntry = [], isEndOfLine = false) {
	let endOfLineResponse;

	// console.log(line);
	// If comment is active, look for the end of the comment or continue
	if (target.active.comment === true) {
		const endMatch = special.comment.end(line);
		if (endMatch != null) { // Did we match the end of the comment
			const endOfLine = special.comment.getEndOfLine(line, endMatch);

			// Recursive call with the end of the line in case there are special keys for some reason
			target.active.comment = false;
			endOfLineResponse = processLine(endOfLine, target, lineEntry);
		}
	} else {
		// check for end, if type is not "for" or "if" throw error
		const first = findFirstSpecialStart(line);
		if (first === false) {
			// Push the string
			lineEntry.push(line);
		} else {
			// Handle the special case
			switch (first.type) {
				case "variable":
					// Push the start of the line
					lineEntry.push(getStartOfLine(line, first.match));

					// Push the variable creation
					lineEntry.push(special.variable.create(first.match));

					// Process end of line
					endOfLineResponse = processEndOfLine(line, first.match, target, lineEntry);
					break;
				case "comment":
					target.active.comment = true;

					// Push the start of the line
					lineEntry.push(getStartOfLine(line, first.match));

					// Process end of line
					endOfLineResponse = processEndOfLine(line, first.match, target, lineEntry);

					break;
				case "for":
					// Push the start of the line
					lineEntry.push(getStartOfLine(line, first.match));

					const forTarget = special.for.create(first.match);
					forTarget.parent = target;

					// Push the variable creation
					lineEntry.push(forTarget);

					// Save the current line variables because every after should be added to the new target lines
					// target.lines.push(lineEntry);

					// Process end of line
					endOfLineResponse = processEndOfLine(line, first.match, forTarget, []);

					if (forTarget.id != endOfLineResponse.target.id) {
						endOfLineResponse.lineEntry = [...lineEntry, ...endOfLineResponse.lineEntry];
					} else target.lines.push(lineEntry);

					break;
				case "if":
					// Push the start of the line
					lineEntry.push(getStartOfLine(line, first.match));

					const ifTarget = special.if.create(first.match);
					ifTarget.parent = target;

					// Push the variable creation
					lineEntry.push(ifTarget);

					// Save the current line variables because every after should be added to the new target lines
					// target.lines.push(lineEntry);

					// Process end of line
					endOfLineResponse = processEndOfLine(line, first.match, ifTarget, []);
					// console.log("THE IF RESPONSE:");
					// console.log(endOfLineResponse);
					// console.log("THE CURRENT LINE ENTRY VALUE:");
					// console.log(lineEntry);
					// console.log("THE TARGET ID COMPARISON");
					// console.log(ifTarget.id === endOfLineResponse.target.id);

					// The statement finished on this line so we need to add all of the returned lineEntries to our current array
					if (ifTarget.id != endOfLineResponse.target.id) {
						endOfLineResponse.lineEntry = [...lineEntry, ...endOfLineResponse.lineEntry];
					} else target.lines.push(lineEntry);

					break;
				case "break":
					// Push the start of the line
					lineEntry.push(getStartOfLine(line, first.match));

					// Push the variable creation
					lineEntry.push(special.break.create(first.match));

					// Process end of line
					endOfLineResponse = processEndOfLine(line, first.match, target, lineEntry);
					break;
				case "end":
					// If we have no other entries, we can add the tabs before the end of the line
					let matchedSpace = null;
					if (lineEntry.length === 0) matchedSpace = line.match(/^\t[\t\s]*/);

					lineEntry.push(getStartOfLine(line, first.match));

					if (target.type === "markup") {
						throw new ProcessingError("markup.js",
							["red", "Too many 'end' statements"]
						);
					} else {
						target.lines.push(lineEntry);

						target = target.parent;
						lineEntry = [];
					}

					// Add the space to the end of the line since we had nothing on the line before this
					if (matchedSpace != null) {
						endOfLineResponse = processLine(
							matchedSpace[0] + getEndOfLine(line, first.match),
							target,
							lineEntry
						);
					} else endOfLineResponse = processEndOfLine(line, first.match, target, lineEntry);
					break;
			}
		}
	}

	if (endOfLineResponse) {
		lineEntry = endOfLineResponse.lineEntry;
		target = endOfLineResponse.target;
	}

	return { lineEntry, target }
}
module.exports = {
	parse: function (html) {
		const markup = {
			type: 'markup',
			lines: [],
			active: {}
		}

		try {
			let splitHtml = html.split(/\r?\n/);
			let currentTarget = markup; // Where we're currently adding lines

			// splitHtml = [splitHtml[1]];
			// splitHtml = [splitHtml[0], splitHtml[1]];
			// splitHtml = [splitHtml[0], splitHtml[1], splitHtml[2], splitHtml[3]];

			for (const line of splitHtml) {
				const lineResult = processLine(line, currentTarget);
				currentTarget = lineResult.target;

				currentTarget.lines.push(lineResult.lineEntry);
			}
		} catch (err) {
			if (err.colorLogArgs) tired.log.color(...err.colorLogArgs);
			else {
				console.log("Unhandled markup error:");
				console.log(err);
			}
		}
		return markup;
	},
	compile: function (markup, attributes, compileInfo = {}) {
		// console.log("COMPILING THE MARKUP!");


		// console.log(markup.lines);

		let compiledHtml = "";
		let breakLoop = false;
		let lineHtml, compileResult;
		for (let lineIndex = 0; lineIndex < markup.lines.length; lineIndex++) {
			const lineInfo = markup.lines[lineIndex];
			lineHtml = "";

			for (let sameLineIndex = 0; sameLineIndex < lineInfo.length; sameLineIndex++) {
				const lineEntry = lineInfo[sameLineIndex];

				if (typeof lineEntry === 'string') lineHtml += lineEntry;
				else {
					switch (lineEntry.type) {
						case 'variable':
							// let variableValue;
							// The key matches the first variable so we're trying to reference that compileInfo object
							// if (compileInfo != undefined && compileInfo.key === lineEntry.variable) {
							// 	variableValue = values.getVariableValue(lineEntry, compileInfo.attributes);
							// } else variableValue = values.getVariableValue(lineEntry, attributes);
							const variableValue = values.getVariableValueFromEither(lineEntry, attributes, compileInfo)

							if (variableValue != undefined) lineHtml += variableValue;
							break;
						case 'if':
							if (typeIf.validateCondition(lineEntry.condition, attributes, compileInfo)) {
								compileResult = module.exports.compile(lineEntry, attributes);
								lineHtml += compileResult.compiledHtml;
							}
							break;
						case 'break':
							if (typeIf.validateCondition(lineEntry.condition, attributes, compileInfo)) breakLoop = true;
							break;
						default:

							const loopValues = values.getVariableValue(lineEntry.condition.secondValue, attributes);

							if (loopValues != undefined) {
								const newLoopInfo = {
									key: lineEntry.condition.firstValue,
									attributes: {}
								}
								for (let loopIndex = 0; loopIndex < loopValues.length; loopIndex++) {
									const loopValue = loopValues[loopIndex];
									newLoopInfo.attributes[newLoopInfo.key] = loopValue;
									attributes._index = loopIndex;
									compileResult = module.exports.compile(lineEntry, attributes, newLoopInfo);
									lineHtml += compileResult.compiledHtml;

									if (compileResult.breakLoop) break;
								}
							}
							break;
					}
				}
			}

			if (breakLoop) break;

			compiledHtml += lineHtml;
			if (lineIndex != markup.lines.length - 1) compiledHtml += "\n";
		}

		return {
			breakLoop,
			compiledHtml
		}
	}
}