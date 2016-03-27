'use strict';
// this file is used to run spikermonkey solutions in node

var readline = require('readline');
var lines = [];
var pointer = 0;
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

rl.on('line', function online(line){
	lines.push(line);
});

rl.on('close', function onclose(){
	require(process.env.PROBLEM);
});

global.readline = function readlineGlobal() {
	if (pointer >= lines.length) {
		return null;
	}

	return lines[pointer++];
};

global.print = console.log;
