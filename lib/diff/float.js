'use strict';
var line = require('./line');

module.exports = function diff(options, actual, expected) {
	var epsilon = 1 / Math.pow(10, options.epsilon || 10);
	var actualValues = actual.split(/\s+/).map(parseFloat);
	var expectedValues = expected.split(/\s+/).map(parseFloat);
	var match;
	var i;
	var parts = [];

	// if number of lines don't match we default to line diff, and assume no match
	if (expectedValues.length !== actualValues.length) {
		match = line(options, actual, expected);
		match.match = false;
		match.message = 'Mismatch in # of output lines, showing line diff';
		return match;
	}

	match = true;
	for (i = 0; i < expectedValues.length; i++) {
		// trailing newlines add NaNs
		if (isNaN(expectedValues[i]) && isNaN(actualValues[i])) {
			continue;
		}

		if (Math.abs(expectedValues[i] - actualValues[i]) < epsilon) {
			parts.push({
				value: actualValues[i] + '\n'
			});
		}
		else {
			match = false;
			parts.push({
				value: expectedValues[i] + '\n',
				removed: true
			});
			parts.push({
				value: actualValues[i] + '\n',
				added: true
			});
		}
	}

	return {
		match: match,
		parts: parts
	};
};
