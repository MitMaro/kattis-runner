'use strict';
var init = require('../init');
var path = require('path');
var fs = require('fs');

module.exports.builder = {
	directory: {
		string: true,
		requiresArg: true,
		default: path.join(process.cwd(), 'problems'),
		description: 'Directory to generate problem files',
		normalize: true
	},
	config: {
		config: true,
		configParser: function configParser(configPath) {
			return JSON.parse(fs.readFileSync(configPath, 'utf-8')).init;
		},
		default: '.kattisrc'
	}
};

module.exports.handler = init;
