'use strict';
var _ = require('lodash');
var streamBuffers = require('stream-buffers');
var expect = require('chai').expect;
var scenarios = require('./scenarios');
var runner = require('../../lib/runner');
var ROOT_DIRECTORY = __dirname;

describe('runner.js', () => {
	scenarios.forEach((s) => {
		describe(s.description, () => {
			var stdout = new streamBuffers.WritableStreamBuffer();
			var stderr = new streamBuffers.WritableStreamBuffer();
			var options;
			var error;

			before((done) => {
				error = undefined;
				stdout = new streamBuffers.WritableStreamBuffer();
				stderr = new streamBuffers.WritableStreamBuffer();
				stdout.isTTY = true;
				stderr.isTTY = true;
				options = _.merge({
					problemsDirectory: ROOT_DIRECTORY + '/' + s.problemsDirectory,
					stdout: stdout,
					stderr: stderr
				}, s.options || {});

				if (s.buildDirectory.charAt(0) !== '/') {
					options.buildDirectory = ROOT_DIRECTORY + '/' + s.buildDirectory;
				}
				else {
					options.buildDirectory = s.buildDirectory;
				}

				if (s.problemId) {
					options.id = s.problemId;
				}

				runner(options, (err) => {
					error = err;
					done();
				});
			});

			if (s.expectedError) {
				it('should have matching error', () => {
					expect(error.toString()).to.match(s.expectedError);
				});
			}

			if (s.expectedStdout) {
				it('should have matching stdout', () => {
					// strip color codes
					var output = stdout.getContentsAsString('utf8');

					if (output) {
						output = output.replace(/\x1b\[[0-9;]*m/g, '');
					}
					s.expectedStdout.forEach((exp) => {
						expect(output).to.match(exp);
					});
				});
			}

			if (s.expectedStderr) {
				it('should have matching stderr', () => {
					// strip color codes
					var output = stderr.getContentsAsString('utf8');

					if (output) {
						output = output.replace(/\x1b\[[0-9;]*m/g, '');
					}
					s.expectedStderr.forEach((exp) => {
						expect(output).to.match(exp);
					});
				});
			}
		});
	});
});
