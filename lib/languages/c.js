'use strict';
var path = require('path');

module.exports = {
	getCompileCommand: function getCompileCommand(problem, options) {
		return [
			'cc',
			'-g',
			'-O2',
			'-std=gnu99',
			'-static',
			path.join(options.problemsDirectory, problem.id, 'c', 'solution.c'),
			'-o',
			path.join(options.buildDirectory, problem.id + '.bin'),
			'-lm',
			options.cFlags
		].join(' ');
	},

	getRunCommand: function getRunCommand(problem, options) {
		return path.join(options.buildDirectory, problem.id + '.bin');
	}
};
