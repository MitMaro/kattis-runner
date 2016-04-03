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

module.exports = function run(options) {
	var tasks = [];

	options.problemsDirectory = path.resolve(options.problemsDirectory);

	// create build directory if it does not exist
	tasks.push(function createBuildDirectory(callback) {
		fs.stat(options.buildDirectory, function createBuildDirectoryCallback(err) {
			if (err) {
				writeError('Build directory missing; creating\n');
				fs.mkdir(options.buildDirectory, callback);
				return null;
			}
			return callback();
		});
	});

	// load only one problem
	if (options.id) {
		tasks.push(function addSingleProblem(callback) {
			var problems = [];

			addProblem(problems, options.id, function addSingleProblemCallback(err) {
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
			fs.readdir(options.problemsDirectory, function addProblemsFromDirectoryCallback(e1, files) {
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
			writeError('\n' + err.message + '\n');
		}
		else {
			process.stdout.write(chalk.green('\nAll problems passed!\n'));
		}
		process.exit(err ? 1 : 0);
	});

	function addProblem(problems, id, callback) {
		fs.stat(path.join(options.problemsDirectory, id), function statProblemsDirCallback(err, stat) {
			var problem;

			if (err) {
				return callback(new Error('Problem, with id ' + id + ', does not exist'));
			}

			if (stat.isDirectory()) {
				try {
					problem = require(path.join(options.problemsDirectory, id, 'description.json'));
					if (!verifyProblemDescription(id, problem)) {
						return callback(new Error('Invalid problem desciption'));
					}
				}
				catch (e) {
					writeError('Problem, with id ' + id + ', does not have required "description.json" file');
					return callback(e);
				}

				// if missing diff we assume line diff
				if (!problem.diff) {
					problem.diff = {
						type: 'line'
					};
				}

				if (problem.skip) {
					process.stderr.write(chalk.blue('Skipping: ' + problem.id) + '\n');
				}
				else {
					problem.languages.forEach(function pushLanguage(language) {
						problems.push(testProblemForLanguage.bind(null, language, problem));
					});
				}
			}
			return callback(null);
		});
	}

	function writeError() {
		process.stderr.write.apply(process.stderr, arguments);
	}

	function testProblemForLanguage(language, problem, cb) {
		var languageModule = languageModules[language];
		var langaugeTasks = [];

		process.stdout.write(chalk.yellow(problem.name + ' (' + language + ')\n'));

		if (languageModule.getCompileCommand) {
			langaugeTasks.push(compileProblem.bind(null, languageModule.getCompileCommand(problem, options)));
		}
		langaugeTasks.push(runProblemForLanguage.bind(null, problem, languageModule.getRunCommand(problem, options)));

		async.series(langaugeTasks, cb);
	}

	function compileProblem(cmd, cb) {
		exec(cmd, function compileProblemCallback(err, stdout, stderr) {
			if (stderr) {
				writeError(stderr);
			}
			if (stdout) {
				writeError(stdout);
			}
			cb(err, stdout, stderr);
		});
	}

	function runProblemForLanguage(problem, cmd, cb) {
		var cases = [];
		var diff;

		if (problem.diff.type === 'custom') {
			diff = require(path.join(options.problemsDirectory, problem.id, 'diff')).bind(null, problem.diff);
		}
		else {
			diff = diffModules[problem.diff.type].bind(null, problem.diff);
		}

		Object.keys(problem.testCases).forEach(function testCasesEach(testFile) {
			var inputFile = fs.readFileSync(path.join(options.problemsDirectory, problem.id, testFile), {
				encoding: 'utf8'
			});
			var ouputFile = fs.readFileSync(path.join(options.problemsDirectory, problem.id, problem.testCases[testFile]), {
				encoding: 'utf8'
			});

			cases.push(runTestCase.bind(null, cmd, diff, testFile, inputFile, ouputFile));
		});
		async.series(cases, cb);
	}

	function runTestCase(cmd, diff, testFile, input, output, cb) {
		var child = exec(cmd, function runTestCaseCallback(err, stdout, stderr) {
			var match;

			if (stderr) {
				writeError(stderr);
			}

			process.stdout.write('\t' + testFile + ': ');

			if (err) {
				process.stdout.write(chalk.red('(fail)'));
				writeError(err.message);
				return cb(err, stdout, stderr);
			}

			match = diff(output, stdout);

			if (!match.match) {
				process.stdout.write(chalk.red('(fail)\n'));

				writeError('Diff (' + chalk.red(testFile) + ', ' + chalk.blue('stdout') + '):\n');
				
				if (match.message) {
					writeError(chalk.yellow(match.message) + '\n');
				}

				match.parts.forEach(function diffPartEach(part){
					if (part.added) {
						writeError(chalk.blue(prefixDiff('> ', part.value)));
					}
					else if (part.removed) {
						writeError(chalk.red(prefixDiff('< ', part.value)));
					}
					else {
						writeError(chalk.grey(prefixDiff('  ', part.value)));
					}
				});

				return cb(new Error('No match'), stdout, stderr);
			}
			
			process.stdout.write(chalk.green('(pass)\n'));
			return cb(null, stdout, stderr);
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
			errors.push('`name` is missing name');
		}

		if (!_.isObject(description.testCases)) {
			errors.push('`testCases` should be an object');
		}

		if (!_.isArray(description.languages)) {
			errors.push('`languages` should be an array');
		}

		if (errors.length) {
			writeError('Problem ' + id + ' errors:\n');
			errors.forEach(function printDescriptionError(error) {
				writeError('\t' + error + '\n');
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
			return lines;
		}

		for (i = 0; i < splitLines.length - 1; i++) {
			output += prefix + splitLines[i] + '\n';
			prefixedLines.push(prefix + splitLines[i]);
		}

		return output;
	}
};
