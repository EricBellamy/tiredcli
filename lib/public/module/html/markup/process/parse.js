const markupRegex = /<\?\s*([\s\S]*?)\s*\?>/m;

module.exports = function (html) {
	let evalString = `
		const node = {
			text: "",
			add: function(text){
				this.text += text;
			}
		}
		const log = function(text){
			node.add(text);
		}
		function run(){
	`;

	let matched = html.match(markupRegex);
	while (matched != null) {
		const markupParts = matched[1].split(";");
		let [lastMarkupPart] = markupParts.slice(-1);

		// Add the before match
		const beforeMatch = html.substring(0, matched.index);
		if (0 < beforeMatch.length) evalString += `node.add(\`${beforeMatch}\`);`;

		// Add the matched
		if (0 < matched[1].length) {
			if (matched[1].slice(-1)[0] != ";") matched[1] += ";";
			evalString += matched[1];
		}

		// Delete consumed text & find the next match
		html = html.substring(matched.index + matched[0].length);
		matched = html.match(markupRegex);
	}
	if (0 < html.length) evalString += `node.add(\`${html}\`);`;
	evalString += `return node.text;}run();`;

	return evalString;
}