'use strict';
var os = require('os');
var path = require('path');

var hrTime = process.hrtime();
var tmpDir = path.join(os.tmpdir(), 'kattis-runner-test-' + (hrTime[0] * 1000000 + hrTime[1]).toString());

module.exports = [
	{
		description: 'with minimal default user input',
		problemId: 'simple',
		problemsDirectory: 'problems/single/',
		buildDirectory: 'build',
		expectedStdout: [
			/simple\.in: \(pass\)/
		]
	},
	{
		description: 'with non-existing build directory',
		problemId: 'simple',
		problemsDirectory: 'problems/single/',
		buildDirectory: tmpDir,
		expectedStdout: [
			/simple\.in: \(pass\)/
		],
		expectedStderr: [
			/Build directory missing; creating/
		]
	},
	{
		description: 'with no id',
		problemsDirectory: 'problems/multiple/',
		buildDirectory: tmpDir,
		expectedStdout: [
			/mock1\.in: \(pass\)/,
			/mock2\.in: \(pass\)/
		]
	},
	{
		description: 'with no id and invalid problem directory',
		problemsDirectory: 'problems/multiple-invalid/',
		buildDirectory: tmpDir,
		expectedError: /EISDIR/
	},
	{
		description: 'with problems directory containing file',
		problemsDirectory: 'problems/single-file/',
		buildDirectory: tmpDir,
		expectedStderr: [
			/Skipping file: foo/
		]
	},
	{
		problemId: 'invalid.id',
		description: 'with invalid description id',
		problemsDirectory: 'problems/single/',
		buildDirectory: tmpDir,
		expectedError: /Invalid problem desciption/,
		expectedStderr: [
			/`id` is missing or invalid/
		]
	},
	{
		problemId: 'invalid.name',
		description: 'with invalid description name',
		problemsDirectory: 'problems/single/',
		buildDirectory: tmpDir,
		expectedError: /Invalid problem desciption/,
		expectedStderr: [
			/`name` is missing/
		]
	},
	{
		problemId: 'invalid.test-cases',
		description: 'with invalid test cases',
		problemsDirectory: 'problems/single/',
		buildDirectory: tmpDir,
		expectedError: /Invalid problem desciption/,
		expectedStderr: [
			/`testCases` should be an object/
		]
	},
	{
		problemId: 'invalid.languages',
		description: 'with invalid description langauges',
		problemsDirectory: 'problems/single/',
		buildDirectory: tmpDir,
		expectedError: /Invalid problem desciption/,
		expectedStderr: [
			/`languages` should be an array/
		]
	},
	{
		description: 'with invalid problems directory',
		problemsDirectory: 'problems.invalid',
		buildDirectory: tmpDir,
		expectedError: /ENOENT.*problems.invalid/
	},
	{
		problemId: 'does.not.exist',
		description: 'with non-existing problem',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /Problem, with id does.not.exist, does not exist/
	},
	{
		problemId: 'invalid.missing.description',
		description: 'with missing problem description',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /ENOENT.*invalid.missing.description\//,
		expectedStderr: [
			/Problem, with id invalid.missing.description, does not have required "description.json"/
		]
	},
	{
		problemId: 'invalid.description',
		description: 'with invalid problem description',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /EISDIR/
	},
	{
		problemId: 'missing.test-case',
		description: 'with missing test case file',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /ENOENT.*missing.in/,
		expectedStderr: [
			/Could not read test case, missing.in, for problem with id \'missing.test-case\'/
		]
	},
	{
		problemId: 'invalid.test-case',
		description: 'with invalid test case file',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /EISDIR/
	},
	{
		problemId: 'invalid.json',
		description: 'with invalid json in problem description',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /SyntaxError/,
		expectedStderr: [
			/Problem, with id invalid.json, does not have a valid "description.json" file/
		]
	},
	{
		problemId: 'diff.float',
		description: 'with float diff',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/diff\.in: \(pass\)/
		]
	},
	{
		problemId: 'diff.line',
		description: 'with line diff',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/diff\.in: \(pass\)/
		]
	},
	{
		problemId: 'diff.custom',
		description: 'with custom diff',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/diff\.in: \(pass\)/
		]
	},
	{
		problemId: 'skip',
		description: 'with skipped problem',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStderr: [
			/Skipping: skip/
		]
	},
	{
		problemId: 'c.simple',
		description: 'with simple c program',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/simple\.in: \(pass\)/
		]
	},
	{
		problemId: 'c.error',
		description: 'with c program with complile error',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStderr: [
			/fatal error: not-existst\.stdio\.h: No such file or directory/
		]
	},
	{
		problemId: 'stderr',
		description: 'with a program that writes to stderr',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStderr: [
			/An Error Message/
		],
		expectedStdout: [
			/simple\.in: \(pass\)/
		]
	},
	{
		problemId: 'errorcode',
		description: 'with a program that returns an error code',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /Command failed.*solution.py/
	},
	{
		problemId: 'simple.no-match',
		description: 'with mis-matched output',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /No match/,
		expectedStderr: [
			/Diff \(simple\.in, stdout\)/,
			/\s\saaa/,
			/> ccc/,
			/< fff/
		]
	},
	{
		problemId: 'float.no-match',
		description: 'with float mis-matched output',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /No match/,
		expectedStderr: [
			/Diff \(simple\.in, stdout\)/,
			/> 1.2/,
			/> 1.3/,
			/< 1.1/,
			/< 2.2/
		]
	},
	{
		problemId: 'float.no-match-multiline',
		description: 'with multiline float mis-matched output',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /No match/,
		expectedStderr: [
			/Mismatch in # of output lines, showing line diff/
		]
	},
	{
		problemId: 'simple.single-line-nomatch',
		description: 'with single line mis-matched output',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedError: /No match/,
		expectedStderr: [
			/Diff \(simple\.in, stdout\)/,
			/> aaa/,
			/< bbb/
		]
	},
	{
		problemId: 'js.simple',
		description: 'with simple js problem',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/simple\.in: \(pass\)/
		],
		options: {
			jsCommand: process.env.TEST_JS_COMMAND || 'js',
			jsNode: process.env.TEST_JS_NODE === 'true'
		}
	},
	{
		problemId: 'js.simple',
		description: 'with simple js problem using node',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/simple\.in: \(pass\)/
		],
		options: {
			jsNode: true
		}
	},
	{
		problemId: 'php.simple',
		description: 'with simple php problem',
		problemsDirectory: 'problems/single',
		buildDirectory: tmpDir,
		expectedStdout: [
			/simple\.in: \(pass\)/
		]
	}
];
