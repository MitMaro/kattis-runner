'use strict';
var JsDiff = require('diff');

module.exports = function diff(options, actual, expected) {
	if (actual === expected) {
		return {
			match: true
		};
	}

	return {
		match: false,
		parts: JsDiff.diffLines(actual, expected)
	};
};
