const cache = {};

const regex = {
	end: /{ *end *}/g, // the end terminators for all custom syntax
	for: {
		start: /{ *for [a-zA-Z0-9]+ of [a-zA-Z0-9.]+ *}/,
		variable: /for (\w+) of ([\w.]+)/, // gets 'recipe' and 'recipes' from { for recipe of recipes }
		loop: /{ *for [a-zA-Z0-9]+ of [a-zA-Z0-9.]+ *}(.*?){ *end *}/s,
	},
	value: {
		attribute: /\{ *(\w+) *\}/s, // { title }
		object: /\{ *(\w+\.(?:\w+\.)+\w+) *\}/s, // { recipe.title }
	},
	if: {
		// break: /{\s*if\s+(.+?)\s+break\s*}/,
		break: /{\s*if\s+(.+?)\s+break\s*}(?![^<]*?>)/,
		// statement: /(?<!<!--\s*)(\{\s*if\s+!?\w+\s*\})(.*?)(\{\s*end\s*\})/s, // { if _index } HELLO WORLD { end }, { if _index = otherVariable } HELLO WORLD { end }, or any string, number, true/false in place of otherVariable
		statement: /^(?!\s*<!--).*?(\{\s*if\s+!?\w+\s*\})(.*?)(\{\s*end\s*\})(?<!--\s*)$/s,
		// {\s*if\s+[\w\s!=<>]+\s*}(.*?){ *end *}
	}
}

// const pattern = /^(?!\s*<!--)(?s).*?(\{\s*if\s+!?\w+\s*\})(.*?)(\{\s*end\s*\})(?<!--\s*)$/;
// const pattern = /^(?!\s*<!--).*?(\{\s*if\s+!?\w+\s*\})(.*?)(\{\s*end\s*\})(?<!--\s*)$/s;

// const str1 = "<!-- { if _index === 2 }\n{ if !_index }\nHELLO WORLD\n{end} -->";
// const str2 = "{ if !_index }\nHELLO WORLD\n{end}";
// const str3 = "<!-- { if !_index }\nHELLO WORLD\n{end} -->";

// if (pattern.test(str1)) {
//   console.log("String 1 matches the pattern");
// } else {
//   console.log("String 1 does not match the pattern");
// }

// if (pattern.test(str2)) {
//   console.log("String 2 matches the pattern");
// } else {
//   console.log("String 2 does not match the pattern");
// }

// if (pattern.test(str3)) {
//   console.log("String 3 matches the pattern");
// } else {
//   console.log("String 3 does not match the pattern");
// }


function getValueOrVariable(str) {
	// Check if it's true || false
	if (str == "true") return true;
	else if (str == "false") return false
	else if (!isNaN(str)) return Number(str); // Check if it's a number
	else {
		// Check if it has single or double quotes & return the capture
		const doubleQuoteMatch = str.match(/"([^"]*)"/);
		if (doubleQuoteMatch != null) return doubleQuoteMatch[1];
		const singleQuoteMatch = str.match(/'([^']*)'/);
		if (singleQuoteMatch != null) return singleQuoteMatch[1];

		return { variable: str }; // Otherwise it's a variable
	}
}

module.exports = {
	validateIfStatements: function (html, attributes) {
		html = `
		<include src="card/drink.html" base="{base}Featured{_index}" img="{data.image_url}"
				alt="{data.title} image" p="{data.title}" />

				<!-- { if _index === 2 }
				{ if !_index }
					HELLO WORLD
				{end} -->
		`

		/*
		{ if _index }
		{ if !_index }
		{ if _index === true }
		{ if _index === false }
		{ if _index === 123 }
		{ if _index === 'test' }
		{ if _index === otherVariable }
		*/


		let matches = [];
		let match = html.match(regex.if.statement);
		console.log("THE IF STATEMENT MATCH");
		console.log(match);
		while (match != null) {
			const ifParams = match[1].trim();
			const ifContents = match[2].trim();
			const ifParamParts = ifParams.split(" ");

			let config = {
				operator: "===",
				firstValue: getValueOrVariable(ifParamParts[0]),
				secondValue: true,
			}
			console.log("THE MATCH DETAILS:");
			console.log(ifParamParts);

			// Is this { if _index })
			if (1 === ifParamParts.length) {
				// Is this { if !_index break }
				if (ifParamParts[0][0] === '!') {
					config.firstValue = getValueOrVariable(ifParamParts[0].slice(1));
					config.secondValue = false;
				}
			} else {
				
			}

			console.log(config);

			// If condition is met, replace with if statement contents (match[2])
			// Otherwise, replace with empty string
			break;
		}
		// return html;
	},
	findBreakStatements: function (html) {
		// Get cache
		const cacheKey = tired.cache.key.fromString(html);
		if (tired.cache.data.has('html/parser.js/findBreakStatements', cacheKey)) return tired.cache.data.get('html/parser.js/findBreakStatements', cacheKey);

		tired.log.color.start('parser.js');

		let matches = [];
		let match = html.match(regex.if.break);
		while (match != null) {
			const ifParams = match[1].trim();
			const ifParamParts = ifParams.split(" ");

			let config = {
				operator: "===",
				firstValue: getValueOrVariable(ifParamParts[0]),
				secondValue: true,
			}
			// Is this { if _index break })
			if (1 === ifParamParts.length) {
				// Is this { if !_index break }
				if (ifParamParts[0][0] === '!') {
					config.firstValue = getValueOrVariable(ifParamParts[0].slice(1));
					config.secondValue = false;
				}
				matches.push(config);
			} else {
				// Is this { if _index = 2 }
				switch (ifParamParts[1]) {
					case "==":
					case "===":
					case "!=":
					case "<":
					case ">":
					case "<=":
					case ">=":
						config.operator = ifParamParts[1];
						config.secondValue = getValueOrVariable(ifParamParts[2]);
						matches.push(config);
						break;
					default:
						tired.log.color('parser.js',
							['red', 'Invalid operator in break statement: "'],
							['magenta', ifParamParts[1]],
							['red', '" from "'],
							['magenta', match[0]],
							['red', '"']);
						break;
				}
			}

			// Delete & rematch
			html = html.replace(match[0], '');
			match = html.match(regex.if.break);
		}
		tired.log.color.stop('parser.js');

		const output = {
			matches: matches,
			html: html
		}

		// Set cache
		return tired.cache.data.set('html/parser.js/findForLoops', cacheKey, output);
	},
	findAttributes: function (html) { // { title } where 'title' is in the data object
		const cacheKey = tired.cache.key.fromString(html);
		if (tired.cache.data.has('html/parser.js/findAttributes', cacheKey)) return tired.cache.data.get('html/parser.js/findAttributes', cacheKey);

		let matches = [];
		let match = html.match(regex.value.attribute);
		while (match != null) {
			matches.push({
				value: match[1],
				matched: match[0]
			});

			// Delete & rematch
			html = html.replace(match[0], '');
			match = html.match(regex.value.attribute);
		}

		return tired.cache.data.set('html/parser.js/findAttributes', cacheKey, matches);
	},
	findObjectReferences: function (html) { // { recipe.value.hourly } where 'recipe' is in the data object
		const cacheKey = tired.cache.key.fromString(html);
		if (tired.cache.data.has('html/parser.js/findObjectReferences', cacheKey)) return tired.cache.data.get('html/parser.js/findObjectReferences', cacheKey);

		let matches = [];
		let match = html.match(regex.value.object);

		while (match != null) {
			matches.push({
				parts: match[1].split('.'),
				matched: match[0]
			});

			// Delete & rematch
			html = html.replace(match[0], '');
			match = html.match(regex.value.object);
		}

		return tired.cache.data.set('html/parser.js/findObjectReferences', cacheKey, matches);

	},
	findVariableMatches: function (html, variableName) { // { for recipe of recipes } { recipe.title } where 'recipe' is each instance of the array from 'recipes' in the data object
		const cacheKey = tired.cache.key.fromString(variableName + "|" + html);
		if (tired.cache.data.has('html/parser.js/findVariableMatches', cacheKey)) return tired.cache.data.get('html/parser.js/findVariableMatches', cacheKey);

		let variableRegex = new RegExp(`\\{ *(${variableName})\\.(\\w+) *\\}`, 's');

		let matches = [];
		let match = html.match(variableRegex);
		while (match != null) {
			matches.push({
				variable: match[1],
				value: match[2],
				matched: match[0]
			});

			// Delete & rematch
			html = html.replace(match[0], '');
			match = html.match(variableRegex);
		}

		return tired.cache.data.set('html/parser.js/findVariableMatches', cacheKey, matches);
	},

	findForLoops: function (html) { // { for recipe of recipes } where 'recipes' is in the data object
		const cacheKey = tired.cache.key.fromString(html);
		if (tired.cache.data.has('html/parser.js/findForLoops', cacheKey)) return tired.cache.data.get('html/parser.js/findForLoops', cacheKey);

		let matches = [];
		let match = html.match(regex.for.loop);
		while (match != null) {
			const forLoopVariables = match[0].match(regex.for.variable);
			const forLoopContent = match[1];
			matches.push({
				variable: forLoopVariables[1],
				iterable: forLoopVariables[2],
				content: forLoopContent,
				matched: match[0]
			});

			// Delete & rematch
			html = html.replace(match[0], '');
			match = html.match(regex.for.loop);
		}

		return tired.cache.data.set('html/parser.js/findForLoops', cacheKey, matches);
	}
}