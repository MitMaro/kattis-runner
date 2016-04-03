'use strict';
var path = require('path');

module.exports = {
	getRunCommand: function getRunCommand(problem, options) {
		return 'php -n -d memory_limit=1024M -d display_errors=stderr -d html_errors=0 ' + path.join(options.problemsDirectory, problem.id, 'php', 'solution.php');
	}
};
