# Kattis Problem Runner

[![Dependency Status](https://david-dm.org/MitMaro/kattis-runner.svg)](https://david-dm.org/MitMaro/kattis-runner)
[![Build Status](https://travis-ci.org/MitMaro/kattis-runner.svg?branch=master)](https://travis-ci.org/MitMaro/kattis-runner)
[![Coverage Status](https://coveralls.io/repos/github/MitMaro/kattis-runner/badge.svg?branch=tests)](https://coveralls.io/github/MitMaro/kattis-runner?branch=tests)
[![NPM version](https://img.shields.io/npm/v/@mitmaro/kattis.svg)](https://www.npmjs.com/package/@mitmaro/kattis)
[![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](https://raw.githubusercontent.com/MitMaro/kattis-runner/master/LICENSE)

Contains an initialization and problem runner for use with the Kattis Open programming challenge problems.

## Install

    npm install --global @mitmaro/kattis

## Usage

    Usage: kattis <command> [options] [id]
    
    Commands:
      init      Initialize a problem
      run [id]  Run problem(s)

    Options:
      --config   Path to JSON config file                     [default: ".kattisrc"]
      --help     Show help                                                 [boolean]
      --version  Show version number                                       [boolean]

## Testing

#### Basic tests

    npm run test

#### With coverage reports

    npm run test:coverage

#### Set JavaScript command

    TEST_JS_COMMAND=js24 npm run test:coverage

#### Force usage of Node

    TEST_JS_NODE=true npm run test:coverage

## License 

This project is released under the ISC license. See [LICENSE](LICENSE).
