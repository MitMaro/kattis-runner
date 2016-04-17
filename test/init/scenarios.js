'use strict';

module.exports = [
	{
		description: 'with minimal default user input',
		input: [
			'foo',
			'',
			'',
			'',
			'',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'with existing directory',
		filesystem: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		},
		input: [
			'foo',
			'',
			'',
			'',
			'',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'with invalid problem id for few attempts',
		input: [
			'', // invalid
			'', // invalid
			'foo',
			'',
			'',
			'',
			'',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'when given name',
		input: [
			'foo',
			'Bar',
			'',
			'',
			'',
			'y',
			''
		],
		expectedFiles: {
			'foo/description.json': '"name": "Bar"'
		}
	},
	{
		description: 'when given case name',
		input: [
			'foo',
			'',
			'case-name',
			'',
			'',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'case-name.in': '',
				'case-name.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'when given # of cases',
		input: [
			'foo',
			'',
			'',
			'2',
			'',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.0.in': '',
				'foo.0.out': '',
				'foo.1.in': '',
				'foo.1.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'when given an invalid # of cases',
		input: [
			'foo',
			'',
			'',
			'0',
			'101',
			'1',
			'',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'when given javascript language',
		input: [
			'foo',
			'',
			'',
			'',
			'javascript',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'javascript': {
					'solution.js': ''
				}
			}
		}
	},
	{
		description: 'when given python language',
		input: [
			'foo',
			'',
			'',
			'',
			'python',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'python': {
					'solution.py': ''
				}
			}
		}
	},
	{
		description: 'when given php language',
		input: [
			'foo',
			'',
			'',
			'',
			'php',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'php': {
					'solution.php': ''
				}
			}
		}
	},
	{
		description: 'when given list of languages with spaces',
		input: [
			'foo',
			'',
			'',
			'',
			'c, javascript',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				},
				'javascript': {
					'solution.js': ''
				}
			}
		}
	},
	{
		description: 'when given list of languages with no spaces',
		input: [
			'foo',
			'',
			'',
			'',
			'c,javascript',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				},
				'javascript': {
					'solution.js': ''
				}
			}
		}
	},
	{
		description: 'when given list of all languages',
		input: [
			'foo',
			'',
			'',
			'',
			'c,javascript,python,php',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				},
				'javascript': {
					'solution.js': ''
				},
				'php': {
					'solution.php': ''
				},
				'python': {
					'solution.py': ''
				}
			}
		}
	},
	{
		description: 'when given invalid language',
		input: [
			'foo',
			'',
			'',
			'',
			'invalid',
			'c',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'when given invalid language in list of langauges',
		input: [
			'foo',
			'',
			'',
			'',
			'c,invalid, javascript',
			'c',
			'y',
			''
		],
		expectedTree: {
			foo: {
				'description.json': '',
				'foo.in': '',
				'foo.out': '',
				'c': {
					'solution.c': ''
				}
			}
		}
	},
	{
		description: 'when rejecting input',
		input: [
			'foo',
			'',
			'',
			'',
			'',
			'n',
			''
		],
		expectedError: 'reject'
	}
];
