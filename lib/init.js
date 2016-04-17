'use strict';
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('async');
var touch = require('touch');
var validator = require('validator');
var promptly = require('promptly');
var jsonfile = require('jsonfile');

var languages = [
	'c', 'python', 'javascript', 'php'
];

var languageFiles = {
	c: 'solution.c',
	python: 'solution.py',
	javascript: 'solution.js',
	php: 'solution.php'
};

jsonfile.spaces = '\t';

module.exports = function run(options, done) {
	var tasks = [
		promptStart,
		promptId,
		promptName,
		promptCaseName,
		promptNumCases,
		promptLanguages,
		promptConfirm,
		createProblemDirectory,
		writeFile
	];

	var stdin = options.stdin || /* istanbul ignore next */ process.stdin;
	var stdout = options.stdout || /* istanbul ignore next */ process.stdout;
	var stderr = options.stderr || /* istanbul ignore next */ process.stderr;
	var _done = done || /* istanbul ignore next */ _.noop;

	async.waterfall(tasks, function tasksCallback(err) {
		if (err) {
			/* istanbul ignore else: error hard to produce */
			if (err.message !== 'reject') {
				stderr.write('Problem description rejected\n');
			}
			else {
				stderr.write('An error occured: ' + err.message + '\n');
			}
			return _done(err);
		}
		stdout.write('Problem files created\n');
		return _done();
	});

	function validatorString(value) {
		if (!validator.isLength(value, 1)) {
			throw new Error('Must be a valid string');
		}
		return value;
	}

	function validatorNumber(value) {
		if (!validator.isInt(value, {min: 1, max: 100})) {
			throw new Error('Number between 1 and 100 required');
		}
		return validator.toInt(value, 10);
	}

	function validatorLanguages(value) {
		var values = value.split(',').map(function strip(v) {
			return v.trim();
		});

		values.forEach(function arrayValueValidate(v) {
			if (!validator.isIn(v, languages)) {
				throw new Error('Languages must be list of ' + languages.join(', '));
			}
		});

		return values;
	}

	function promptStart(callback) {
		return callback(null, {
			id: '',
			name: '',
			caseName: '',
			numCases: '1',
			languages: ['c']
		});
	}

	function promptId(values, callback) {
		promptly.prompt('Problem id', {
			validator: validatorString,
			default: values.id,
			input: stdin,
			output: stdout
		}, function promptIdCallback(err, value) {
			values.id = value;
			return callback(err, values);
		});
	}

	function promptName(values, callback) {
		var defaultValue = values.name || values.id;
		
		promptly.prompt('Problem name', {
			validator: validatorString,
			default: defaultValue,
			input: stdin,
			output: stdout
		}, function promptNameCallback(err, value) {
			values.name = value;
			return callback(err, values);
		});
	}

	function promptCaseName(values, callback) {
		var defaultValue = values.caseName || values.id;

		promptly.prompt('Test case base', {
			validator: validatorString,
			default: defaultValue,
			input: stdin,
			output: stdout
		}, function promptCaseNameCallback(err, value) {
			values.caseName = value;
			return callback(err, values);
		});
	}

	function promptNumCases(values, callback) {
		promptly.prompt('# of test cases', {
			validator: validatorNumber,
			default: values.numCases,
			input: stdin,
			output: stdout
		}, function promptNumCasesCallback(err, value) {
			values.numCases = value;
			return callback(err, values);
		});
	}

	function promptLanguages(values, callback) {
		var defaultValue = values.languages.join(', ');

		promptly.prompt('Languages', {
			validator: validatorLanguages,
			default: defaultValue,
			input: stdin,
			output: stdout
		}, function promptLanguagesCallback(err, value) {
			values.languages = value;
			return callback(err, values);
		});
	}

	function promptConfirm(values, callback) {
		var i;
		var name;
		var description = {
			id: values.id,
			name: values.name,
			testCases: {
			},
			languages: values.languages
		};
		var numCases = parseInt(values.numCases, 10);
		
		if (numCases === 1) {
			description.testCases[values.caseName + '.in'] = values.caseName + '.out';
		}
		else {
			for (i = 0; i < numCases; i++) {
				name = values.caseName + '.' + i;
				description.testCases[name + '.in'] = name + '.out';
			}
		}
		stdout.write('Description File\n');
		stdout.write(JSON.stringify(description, null, '\t') + '\n');

		promptly.confirm('Create Files? [Y/n] ', {
			input: stdin,
			output: stdout
		}, function promptConfirmCallback(err, value) {
			if (value) {
				return callback(err, description);
			}
			return callback('reject');
		});
	}

	function createProblemDirectory(description, callback) {
		var dir = path.join(options.directory, description.id);
		var dirTasks = [
			createDirectory.bind(null, options.directory),
			createDirectory.bind(null, dir)
		];

		description.languages.forEach(function languagesEach(lang) {
			dirTasks.push(createDirectory.bind(null, path.join(dir, lang)));
		});

		async.series(dirTasks, function createDirectoryCallback(err) {
			callback(err, description);
		});
	}

	function createDirectory(dir, callback) {
		fs.stat(dir, function statProblemDirectoryCallback(e1) {
			if (e1) {
				stdout.write(dir + ' missing; creating\n');
				fs.mkdir(dir, function makeProblemDirectoryCallback(e2) {
					return callback(e2);
				});
				return null;
			}
			return callback(null);
		});
	}

	function writeFile(description, callback) {
		var names = Object.keys(description.testCases);
		var dir = path.join(options.directory, description.id);
		var fileTasks = [];
		var i;

		function languagesEach(lang) {
			fileTasks.push(touch.bind(touch, path.join(dir, lang, languageFiles[lang]), {}));
		}

		fileTasks.push(jsonfile.writeFile.bind(jsonfile, path.join(dir, 'description.json'), description));
		description.languages.forEach(languagesEach);

		for (i = 0; i < names.length; i++) {
			fileTasks.push(
				touch.bind(touch, path.join(dir, names[i]), {})
			);
			fileTasks.push(
				touch.bind(touch, path.join(dir, description.testCases[names[i]]), {})
			);
		}

		async.parallel(fileTasks, callback);
	}
};
