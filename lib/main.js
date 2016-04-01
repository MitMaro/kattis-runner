#!/usr/bin/env node
'use strict';
var yargs = require('yargs');
var argv;

if (require.main === module) {
	argv = yargs
		.usage('Usage: $0 <command> [options] [id]')
		.env('KATTIS')
		.config('config')
		.default('config', '.kattisrc')
		.help()
		.version()
		.command('init', 'Initialize a problem', require('./commands/init'))
		.command('run [id]', 'Run problem(s)', require('./commands/run'))
		.strict()
		.argv
	;

	// no command then we show the help
	if (!argv._[0]) {
		yargs.showHelp();
	}
}

module.exports = {
	diff: {
		float: require('./diff/float'),
		line: require('./diff/line')
	}
};
