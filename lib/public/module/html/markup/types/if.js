const Parser = require('expr-eval').Parser;
const values = tired.root.require("lib/public/module/html/markup/values.js");

const parser = new Parser();


module.exports = {
	parseArguments: function (str) {
		let arguments = [];
		let currentArgument = "";
		let nested = false;
		let char, nextChar;
		for (let i = 0; i < str.length - 1; i++) {
			char = str[i];
			nextChar = str[i + 1];

			switch (char) {
				case "(":
					if (nested === false) {
						if (currentArgument.trim().length != 0) arguments.push({ condition: currentArgument.trim(), compareNext: false });
						currentArgument = "";
						nested = true;
					}
					break;
				case ")":
					if (nested === true) {
						if (currentArgument.trim().length != 0) arguments.push({ condition: currentArgument.trim(), compareNext: false });
						currentArgument = "";
						nested = false;
					}
					break;
				case "|":
					if (nested) currentArgument += char;
					else if (char === nextChar) {
						if (currentArgument.trim().length === 0) arguments[arguments.length - 1].compareNext = "or";
						else arguments.push({ condition: currentArgument.trim(), compareNext: "or" });
						currentArgument = "";
					}
					break;
				case "&":
					if (nested) currentArgument += char;
					else if (char === nextChar) {
						if (currentArgument.trim().length === 0) arguments[arguments.length - 1].compareNext = "and";
						else arguments.push({ condition: currentArgument.trim(), compareNext: "and" });
						currentArgument = "";
					}
					break;
				default:
					currentArgument += char;
					break;
			}

			if (i === str.length - 2) {
				if (nextChar === ")") {
					if (nested === true) arguments.push({ condition: currentArgument.trim() });
				} else if (nextChar != "(" && nextChar != "|" && nextChar != "&") arguments.push({ condition: (currentArgument + nextChar).trim() });
			}
		}

		for (const argument of arguments) {
			if (argument.condition.includes("||") || argument.condition.includes("&&")) {
				argument.condition = module.exports.parseArguments(argument.condition);
			}
		}

		return arguments;
	},
	formatConditions: function (unformattedConditions) {
		for (const argument of unformattedConditions) {
			if (typeof argument.condition === 'string') {
				// (?<= |^)(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|[^\s\"']+)(?= |$)

				// const parts = argument.condition.split(" ");
				const parts = argument.condition.match(/(?<= |^)(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|[^\s\"']+)(?= |$)/g);
				let config = {
					operator: "===",
					firstValue: values.getValueOrVariable(parts[0]),
					secondValue: true,
				}

				if (parts[0][0] === '!') { // Is this { if !variable break }
					config.firstValue = parts[0].slice(1)
					config.secondValue = false;
				}

				if (parts.length === 2) return false; // Invalid condition
				else if (parts.length === 3) {
					if (!values.isValidOperator(parts[1])) return false;

					config.operator = parts[1];
					config.secondValue = values.getValueOrVariable(parts[2]);
				} else {
					// Find the valid operator in here
					let evaluationString, secondValueString;
					for (let a = 0; a < parts.length; a++) {
						const part = parts[a];
						if (values.isValidOperator(part)) {
							config.operator = part;
							evaluationString = parts.slice(0, a).join(" ");
							secondValueString = parts.slice(parts.length - 1).join(" ");
						}
					}
					config.firstValue = { math: parser.parse(evaluationString) }
					if (secondValueString.length != 0) config.secondValue = values.getValueOrVariable(secondValueString);
				}

				argument.condition = config;

			} else {
				const formattedConditions = module.exports.formatConditions(argument.condition);
				if (formattedConditions === false) return false;
				argument.condition = formattedConditions;
			}
		}
		return unformattedConditions;
	},
	validateCondition: function (conditions, attributes = {}, templateAttributes = {}) {
		let lastCompare;
		for (const target of conditions) {
			const condition = target.condition;
			let operatorResult = false;

			// If condition
			if (tired.help.isObject(condition)) {
				// Is the first value a variable
				let firstValue = condition.firstValue;
				if (tired.help.isObject(firstValue)) firstValue = values.getVariableValueFromEither(firstValue, attributes, templateAttributes);

				// Is the second value a variable
				let secondValue = condition.secondValue;
				if (tired.help.isObject(secondValue)) secondValue = values.getVariableValueFromEither(secondValue, attributes, templateAttributes);

				// Execute the operator for the values
				operatorResult = values.validateOperator(condition.operator, firstValue, secondValue);

				// We can return immediately if these cases are true
			} else { // Nested if condition "( true || true )"
				operatorResult = this.validateCondition(condition, attributes, templateAttributes);
			}

			if (operatorResult === false) { // Should we return false
				// ( current && )
				// ( last && current &NOT '||' )
				if (target.compareNext === 'and' || (lastCompare === 'and' && target.compareNext != 'or')) return false;

			} else { // Should we return true
				// ( current || )
				// ( last || current &NOT '&&' )
				if (target.compareNext === undefined || target.compareNext === 'or' || (lastCompare === 'or' && target.compareNext != 'and')) return true;
			}

			// Set the current values
			lastCompare = target.compareNext;
		}

		return false;
	}
}