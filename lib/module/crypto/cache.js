const cache = {};

function generateKeyFromString(stringData) {
	// Check if the key is already cached
	if (module.exports.data.has('crypto/cache.js/generateKeyFromString', stringData)) return module.exports.data.get('crypto/cache.js/generateKeyFromString', stringData);
	else {
		// Generate the new key
		const key = Buffer.from(stringData).toString("base64");
		return module.exports.data.set('crypto/cache.js/generateKeyFromString', stringData, key);;
	}
}

module.exports = {
	key: {
		fromString: function (stringData) { return generateKeyFromString(stringData); },
		fromObject: function (objectData) { return generateKeyFromString(JSON.stringify(objectData)); },
		fromMixed: function(...args){
			let stringData = '';
			for (const arg of args) {
				if (typeof arg === 'object') stringData += JSON.stringify(arg);
				else stringData += arg;
			}
			return this.fromString(stringData);
		}
	},
	data: {
		set: function (group, key, value) {
			if (cache[group] === undefined) cache[group] = {};
			cache[group][key] = value;
			return value;
		},
		get: function (group, key) {
			return cache[group] !== undefined ? cache[group][key] : undefined;
		},
		has: function (group, key) {
			return cache[group] !== undefined && cache[group][key] !== undefined;
		},
		clear: function (group) {
			cache[group] = {};
		}
	}
}