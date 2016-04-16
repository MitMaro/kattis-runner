'use strict';

var walk = require('walk');
var traverse = require('traverse');
var async = require('async');

function makeFileSystem(root, fileSystem, done) {
	var fs = require('fs');
	var cmds = [
		fs.mkdir.bind(fs, root)
	];

	traverse(fileSystem).forEach(function traverseFileSystem(data) {
		var path;

		// nothing for root
		if (this.isRoot) {
			return;
		}

		path = root + '/' + this.path.join('/');

		if (this.isLeaf) {
			cmds.push(fs.writeFile.bind(fs, path, data));
		}
		else {
			cmds.push(fs.mkdir.bind(fs, path));
		}
	});
	async.series(cmds, done);
}


function tree(dir, callback) {
	var walker = walk.walk(dir);
	var results = {};

	results[dir] = {};
	walker
		.on('file', function treeOnFile(root, fileStats, next) {
			var r = traversePath(root, results);

			r[fileStats.name] = '';
			next();
		})
		.on('directory', function treeOnDirectory(root, fileStats, next) {
			var r = traversePath(root, results);

			r[fileStats.name] = {};
			next();
		})
		.on('end', function treeOnEnd() {
			callback(null, results[dir]);
		})
	;
}

function traversePath(path, results) {
	var parts = path.split('/');
	var r = results;
	var i;

	for (i = 0; i < parts.length; i++) {
		r = r[parts[i]];
	}
	return r;
}

module.exports = {
	makeFileSystem: makeFileSystem,
	tree: tree
};
