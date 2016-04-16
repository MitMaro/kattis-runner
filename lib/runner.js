'use strict';

var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

var languageModules = {
	c: require('./languages/c'),
	python: require('./languages/python'),
	javascript: require('./languages/javascript'),
	php: require('./languages/php')
};

var diffModules = {
	line: require('./diff/line'),
	float: require('./diff/float')
};

module.exports = function run(options, done) {
	var tasks = [];

	var stdout = options.stdout || /* istanbul ignore next */ process.stdout;
	var stderr = options.stderr || /* istanbul ignore next */ process.stderr;
	var _done = done || /* istanbul ignore next */ _.noop;
	var problemsDirectory = path.resolve(options.problemsDirectory);
	var buildDirectory = options.buildDirectory;
	var problemId = options.id;

	// create build directory if it does not exist
	tasks.push(function createBuildDirectory(callback) {
		fs.stat(buildDirectory, function createBuildDirectoryCallback(err) {
			if (err) {
				stderr.write('Build directory missing; creating\n');
				fs.mkdir(buildDirectory, callback);
				return null;
			}
			return callback();
		});
	});

	// load only one problem
	if (problemId) {
		tasks.push(function addSingleProblem(callback) {
			var problems = [];

			addProblem(problems, problemId, function addSingleProblemCallback(err) {
				if (err) {
					return callback(err);
				}
				async.series(problems, callback);
				return null;
			});
		});
	}
	else {
		// load problems from directory
		tasks.push(function addProblemsFromDirectory(callback) {
			fs.readdir(problemsDirectory, function addProblemsFromDirectoryCallback(e1, files) {
				var i;
				var folders = [];
				var problems = [];

				if (e1) {
					return callback(e1);
				}

				for (i = 0; i < files.length; i++) {
					folders.push(addProblem.bind(null, problems, files[i]));
				}

				async.series(folders, function foldersCompleteCallback(e2) {
					if (e2) {
						return callback(e2);
					}
					async.series(problems, callback);
					return null;
				});
				return null;
			});
		});
	}

	async.series(tasks, function tasksCallback(err) {
		if (err) {
			stderr.write('\n' + err.message + '\n');
		}
		else {
			stdout.write(chalk.green('\nAll problems passed!\n'));
		}
		return _done(err);
	});

	function addProblem(problems, id, callback) {
		fs.stat(path.join(problemsDirectory, id), function statProblemsDirCallback(err, stat) {
			var problem;

			if (err) {
				return callback(new Error('Problem, with id ' + id + ', does not exist'));
			}

			if (stat.isDirectory()) {
				fs.readFile(path.join(problemsDirectory, id, 'description.json'), function readDescriptionFileCallback(e, data) {
					if (e) {
						if (e.code === 'ENOENT') {
							stderr.write('Problem, with id ' + id + ', does not have required "description.json" file\n');
						}
						return callback(e);
					}

					try {
						problem = JSON.parse(data.toString('utf8'));
					}
					catch (parseErr) {
						stderr.write('Problem, with id ' + id + ', does not have a valid "description.json" file\n');
						return callback(parseErr);
					}

					if (!verifyProblemDescription(id, problem)) {
						return callback(new Error('Invalid problem desciption'));
					}

					// if missing diff we assume line diff
					if (!problem.diff) {
						problem.diff = {
							type: 'line'
						};
					}

					if (problem.skip) {
						stderr.write(chalk.blue('Skipping: ' + problem.id) + '\n');
					}
					else {
						problem.languages.forEach(function pushLanguage(language) {
							problems.push(testProblemForLanguage.bind(null, language, problem));
						});
					}
					return callback(null);
				});
			}
			else {
				stderr.write(chalk.blue('Skipping file: ' + id) + '\n');
				return callback(null);
			}
			return null;
		});
	}

	function testProblemForLanguage(language, problem, cb) {
		var languageModule = languageModules[language];
		var langaugeTasks = [];

		stdout.write(chalk.yellow(problem.name + ' (' + language + ')\n'));

		if (languageModule.getCompileCommand) {
			langaugeTasks.push(compileProblem.bind(null, languageModule.getCompileCommand(problem, options)));
		}
		langaugeTasks.push(runProblemForLanguage.bind(null, problem, languageModule.getRunCommand(problem, options)));

		async.series(langaugeTasks, cb);
	}

	function compileProblem(cmd, cb) {
		exec(cmd, function compileProblemCallback(err, sout, serr) {
			if (serr) {
				stderr.write(serr);
			}
			/* istanbul ignore if: Hard to reach this path, most output is to stderr */
			if (sout) {
				stderr.write(sout);
			}
			cb(err, sout, serr);
		});
	}

	function runProblemForLanguage(problem, cmd, cb) {
		var diff;
		var fileTasks = [];

		if (problem.diff.type === 'custom') {
			diff = require(path.join(problemsDirectory, problem.id, 'diff')).bind(null, problem.diff);
		}
		else {
			diff = diffModules[problem.diff.type].bind(null, problem.diff);
		}

		Object.keys(problem.testCases).forEach(function testCasesForEach(testCase) {
			fileTasks.push(loadFilesForTestCase.bind(null, problem, testCase));
		});

		async.parallel(fileTasks, function fileTasksForEach(err, results) {
			var cases = [];

			if (err) {
				return cb(err);
			}
			results.forEach(function resultsForEach(testCase) {
				cases.push(runTestCase.bind(null, cmd, diff, testCase.testCase, testCase.inputFile, testCase.outputFile));
			});
			async.series(cases, cb);
			return null;
		});
	}

	function loadFilesForTestCase(problem, testCase, cb) {
		async.series({
			input: fs.readFile.bind(fs, path.join(problemsDirectory, problem.id, testCase), {
				encoding: 'utf8'
			}),
			output: fs.readFile.bind(fs, path.join(problemsDirectory, problem.id, problem.testCases[testCase]), {
				encoding: 'utf8'
			})
		}, function readIOCallback(err, result) {
			if (err) {
				if (err.code === 'ENOENT') {
					stderr.write('Could not read test case, ' + testCase + ', for problem with id \'' + problem.id + '\'\n');
				}
				return cb(err);
			}
			return cb(null, {
				testCase: testCase,
				inputFile: result.input,
				outputFile: result.output
			});
		});
	}

	function runTestCase(cmd, diff, testFile, input, output, cb) {
		var child = exec(cmd, function runTestCaseCallback(err, sout, serr) {
			var match;

			if (serr) {
				stderr.write(serr);
			}

			stdout.write('\t' + testFile + ': ');

			if (err) {
				stdout.write(chalk.red('(fail)'));
				stderr.write(err.message);
				return cb(err, sout, serr);
			}

			match = diff(output, sout);

			if (!match.match) {
				stdout.write(chalk.red('(fail)\n'));

				stderr.write('Diff (' + chalk.red(testFile) + ', ' + chalk.blue('stdout') + '):\n');
				
				if (match.message) {
					stderr.write(chalk.yellow(match.message) + '\n');
				}

				match.parts.forEach(function diffPartEach(part){
					if (part.removed) {
						stderr.write(chalk.red(prefixDiff('< ', part.value)));
					}
					else if (part.added) {
						stderr.write(chalk.blue(prefixDiff('> ', part.value)));
					}
					else {
						stderr.write(chalk.grey(prefixDiff('  ', part.value)));
					}
				});

				return cb(new Error('No match'), sout, serr);
			}
			stdout.write(chalk.green('(pass)\n'));
			return cb(null, sout, serr);
		});
		
		child.stdin.write(input);
		child.stdin.end();
	}

	function verifyProblemDescription(id, description) {
		var errors = [];

		if (description.id !== id) {
			errors.push('`id` is missing or invalid');
		}

		if (!description.name) {
			errors.push('`name` is missing');
		}

		if (!_.isObject(description.testCases)) {
			errors.push('`testCases` should be an object');
		}

		if (!_.isArray(description.languages)) {
			errors.push('`languages` should be an array');
		}

		if (errors.length) {
			stderr.write('Problem ' + id + ' errors:\n');
			errors.forEach(function printDescriptionError(error) {
				stderr.write('\t' + error + '\n');
			});
			return false;
		}
		return true;
	}

	function prefixDiff(prefix, lines) {
		var i;
		var prefixedLines = [];
		var output = '';
		var splitLines = lines.split('\n');

		if (splitLines.length === 1) {
			return prefix + lines;
		}

		for (i = 0; i < splitLines.length - 1; i++) {
			output += prefix + splitLines[i] + '\n';
			prefixedLines.push(prefix + splitLines[i]);
		}

		return output;
	}
};
