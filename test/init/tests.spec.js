'use strict';
var _ = require('lodash');
var streamBuffers = require('stream-buffers');
var mock = require('mock-fs');
var fs = require('fs');
var expect = require('chai').expect;
var scenarios = require('./scenarios');
var util = require('../util');
var init = require('../../lib/init');

var TEST_DIRECTORY = 'test';
var stdout = new streamBuffers.WritableStreamBuffer();
var stderr = new streamBuffers.WritableStreamBuffer();

stdout.isTTY = true;
stderr.isTTY = true;


describe('init.js', () => {
	scenarios.forEach((s) => {
		describe(s.description, () => {
			var stdin;

			beforeEach((done) => {
				stdin = new streamBuffers.ReadableStreamBuffer();
				stdin.pause();
				mock();
				if (s.filesystem) {
					return util.makeFileSystem(TEST_DIRECTORY, s.filesystem, done);
				}
				return done();
			});

			if (s.expectedTree) {
				it('should create correct file structure', (done) => {
					init({
						stdin: stdin,
						stdout: stdout,
						stderr: stderr,
						directory: TEST_DIRECTORY
					},
					util.tree.bind(null, TEST_DIRECTORY, (err, result) => {
						expect(err).to.be.null;
						expect(result).to.deep.equal(s.expectedTree);
						done();
					}));
					stdin.put(s.input.join('\n'));
				});
			}

			if (s.expectedFiles) {
				_.each(s.expectedFiles, (match, name) => {
					it('should have matching file contents for ' + name, (done) => {
						init({
							stdin: stdin,
							stdout: stdout,
							stderr: stderr,
							directory: TEST_DIRECTORY
						},
						fs.readFile.bind(fs, TEST_DIRECTORY + '/' + name, (err, data) => {
							expect(err).to.be.null;
							expect(data.toString()).to.have.string(match);
							done();
						}));
						stdin.put(s.input.join('\n'));
					});
				});
			}

			if (s.expectedError) {
				it('should result in error', (done) => {
					init({
						stdin: stdin,
						stdout: stdout,
						stderr: stderr,
						directory: TEST_DIRECTORY
					},
					(err) => {
						expect(err).to.equal(s.expectedError);
						done();
					});
					stdin.put(s.input.join('\n'));
				});
			}
		});
	});

	// make sure we restore the fs module when we are done, or bad things will happen
	after(mock.restore);
});
