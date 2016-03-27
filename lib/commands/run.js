'use strict';
var runner = require('../runner');
var path = require('path');
var fs = require('fs');

module.exports.builder = {
	'problems-directory': {
		alias: ['p'],
		string: true,
		requiresArg: true,
		default: path.join(process.cwd(), 'problems'),
		description: 'Directory containing the problems',
		normalize: true
	},
	'build-directory': {
		alias: ['b'],
		string: true,
		requiresArg: true,
		default: path.join(process.cwd(), 'build'),
		description: 'Directory to place build files',
		normalize: true
	},
	'c-flags': {
		string: true,
		default: '',
		description: 'Additional flags to pass to the C compiler'
	},
	'js-command': {
		string: true,
		default: 'js',
		description: 'The SpiderMonkey binary'
	},
	'js-node': {
		boolean: true,
		default: false,
		description: 'Run problems with node using the SpiderMonkey-Node compatibility layer'
	},
	'config': {
		config: true,
		configParser: function configParser(configPath) {
			return JSON.parse(fs.readFileSync(configPath, 'utf-8')).run;
		},
		default: '.kattisrc'
	}
};

module.exports.handler = function handler(argv) {
	runner(argv);
};
