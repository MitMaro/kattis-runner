'use strict';
var init = require('../init');
var path = require('path');
var configParser = require('./configParser');

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
		configParser: configParser.bind(null, 'init'),
		default: '.kattisrc'
	}
};

module.exports.handler = function initHandler(options) {
	init(options);
};
