module.exports = {
	generateRandomId: function (length) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result + new Date().getTime();
	},
	getVariableValue: function (variable, values) {
		if (variable.next != undefined) {
			// If the current value is undefined, return undefined and don't go further
			if (values[variable.variable] === undefined) return;
			else return this.getVariableValue(variable.next, values[variable.variable]); // Otherwise go further
		} else return values[variable.variable];
	},
	getVariableValueFromEither: function (variable, values, alternateValues) {
		if (variable.math != undefined) return variable.math.evaluate(values);
		else if (alternateValues.key === variable.variable) return this.getVariableValue(variable, alternateValues.attributes);
		else return this.getVariableValue(variable, values);
	},
	formatVariable: function (str) {
		const secondParts = str.split(".");
		let variableValue, currentValue;
		for (const part of secondParts) {
			const nextVariable = { variable: part };
			if (variableValue === undefined) {
				variableValue = nextVariable;
				currentValue = variableValue;
			} else {
				currentValue.next = nextVariable;
				currentValue = currentValue.next;
			}
		}
		return variableValue;
	},
	getValueOrVariable: function (str) {
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

			return this.formatVariable(str); // Otherwise it's a variable
		}
	},
	isValidOperator: function (operator) {
		return ["==", "===", "!=", "!==", ">", "<", ">=", "<="].includes(operator);
	},
	validateOperator: function (operator, firstValue, secondValue) {
		switch (operator) {
			case "==":
				return firstValue == secondValue;
			case "===":
				return firstValue === secondValue;
			case "!=":
				return firstValue != secondValue;
			case "!==":
				return firstValue !== secondValue;
			case ">":
				return firstValue > secondValue;
			case "<":
				return firstValue < secondValue;
			case ">=":
				return firstValue >= secondValue;
			case "<=":
				return firstValue <= secondValue;
		}

		tired.log.color.start('markup/values.js');
		tired.log.color('markup/values.js',
			['yellow', 'Invalid operator value "'],
			['magenta', operator],
			['yellow', '" used in HTML markup condition'],
		);
		tired.log.color.stop('markup/values.js');
		return false;
	},
}