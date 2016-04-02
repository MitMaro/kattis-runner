'use strict';
var fs = require('fs');

module.exports = function configParser(root, configPath) {
	var file;
	var data;

	try {
		file = fs.readFileSync(configPath, 'utf-8');
	}
	catch (e) {
		// file did not exist
		return {};
	}
	data = JSON.parse(file);
	return data[root];
};
