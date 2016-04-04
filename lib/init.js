'use strict';

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

module.exports = function run(options) {
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

	async.waterfall(tasks, function tasksCallback(err) {
		if (err) {
			console.error('An error occured: ' + err.message);
			return;
		}
		console.log('Problem files created');
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

	function promptStart(callback, values) {
		if (values) {
			return callback(null, values);
		}
		
		return callback(null, {
			id: null,
			name: null,
			caseName: null,
			numCases: '1',
			languages: ['c']
		});
	}

	function promptId(values, callback) {
		promptly.prompt('Problem id:', {
			validator: validatorString,
			default: values.id
		}, function promptIdCallback(err, value) {
			if (err) {
				console.error('Invalid id: ' + err.message);
				return err.retry();
			}
			values.id = value;
			return callback(null, values);
		});
	}

	function promptName(values, callback) {
		var defaultValue = values.name || values.id;

		promptly.prompt('Problem name (' + defaultValue + '):', {
			validator: validatorString,
			default: defaultValue
		}, function promptNameCallback(err, value) {
			if (err) {
				console.error('Invalid name: ' + err.message);
				return err.retry();
			}
			values.name = value;
			return callback(null, values);
		});
	}

	function promptCaseName(values, callback) {
		var defaultValue = values.caseName || values.id;

		promptly.prompt('Test case base (' + defaultValue + '): ', {
			validator: validatorString,
			default: defaultValue
		}, function promptCaseNameCallback(err, value) {
			if (err) {
				console.error('Invalid base case:' + err.message);
				return err.retry();
			}
			values.caseName = value;
			return callback(null, values);
		});
	}

	function promptNumCases(values, callback) {
		promptly.prompt('# of test cases (' + values.numCases + '): ', {
			validator: validatorNumber,
			default: values.numCases
		}, function promptNumCasesCallback(err, value) {
			if (err) {
				console.error('Invalid # of cases:' + err.message);
				return err.retry();
			}
			values.numCases = value;
			return callback(null, values);
		});
	}

	function promptLanguages(values, callback) {
		var defaultValue = values.languages.join(', ');

		promptly.prompt('Languages (' + defaultValue + '): ', {
			validator: validatorLanguages,
			default: defaultValue
		}, function promptLanguagesCallback(err, value) {
			if (err) {
				console.error('Invalid Languages:' + err.message);
				return err.retry();
			}
			values.languages = value;
			return callback(null, values);
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
		console.log('Description File');
		console.log(JSON.stringify(description, null, '\t'));

		promptly.confirm('Create Files? [Y/n] ', function promptConfirmCallback(err, value) {
			if (value) {
				return callback(err, description);
			}
			return callback(new Error('Problem description rejected'));
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
				console.log(dir + ' missing; creating');
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
