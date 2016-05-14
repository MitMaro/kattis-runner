'use strict';
var path = require('path');

module.exports = {
	getRunCommand: function getRunCommand(problem, options) {
		var jsCommand = options.jsCommand;
		var problemPath = path.join(options.problemsDirectory, problem.id, 'javascript', 'solution.js');

		if (options.jsNode) {
			return 'PROBLEM="' + problemPath + '" node ' + path.join(__dirname, 'run-node.js');
		}
		
		/* istanbul ignore next: TravisCI doesn't have SpiderMonkey, so can't test this */
		return jsCommand + ' ' + problemPath;
	}
};
