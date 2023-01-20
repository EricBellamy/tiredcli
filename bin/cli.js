#!/usr/bin/env node
const globals = require('../lib/globals/all.js');
const arguments = process.argv.splice(2);

switch (arguments[0]) {
	case "html":
		require('./cli/html.js')(arguments.splice(1));
		break;
}