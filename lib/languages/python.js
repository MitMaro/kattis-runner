'use strict';
var path = require('path');

module.exports = {
	getRunCommand: function getRunCommand(problem, options) {
		return 'python -B ' + path.join(options.problemsDirectory, problem.id, 'python', 'solution.py');
	}
};
