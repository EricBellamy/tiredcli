const cache = {};

const regex = {
	end: /{ *end *}/g, // the end terminators for all custom syntax
	for: {
		start: /{ *for [a-zA-Z]+ of [a-zA-Z]+ *}/,
		variable: /for (\w+) of (\w+)/, // gets 'recipe' and 'recipes' from { for recipe of recipes }
		loop: /{ *for [a-zA-Z]+ of [a-zA-Z]+ *}(.*?){ *end *}/s,
	},
	value: {
		attribute: /\{ *(\w+) *\}/s, // { title }
		object: /\{ *(\w+\.(?:\w+\.)+\w+) *\}/s, // { recipe.title }
	}
}

module.exports = {
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