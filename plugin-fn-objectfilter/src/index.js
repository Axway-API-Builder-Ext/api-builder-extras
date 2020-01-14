const sdk = require('axway-flow-sdk');
const { include, exclude } = require('./action');

function getFlowNodes() {
	const flownodes = sdk.init(module);

	// The unique name of your flow-node.  You can define multiple flow-nodes in this
	// file, but one is typical.
	flownodes.add('gm-objectfilter', {
		category: 'extension',
		name: 'Filter',
		icon: 'icon.svg',
		description: 'Filter the fields of an Object'
	});

	// Include Method
	flownodes
		.method('include', {
			name: 'Include',
			description: 'Include only the selected fields in the output.'
		})
		.parameter('source', {
			description: 'The source object to filter.',
			type: 'object'
		})
		.parameter('fields', {
			description: 'Limit the output to the following fields. Example: ["field1", "field2", "fieldn"]',
			type: 'array',
			items: {
				type: 'string'
			}
		})
		.output('next', {
			name: 'Next',
			context: '$.filtered',
			schema: {
				type: 'object'
			}
		})
		.output('error', {
			name: 'Error',
			context: '$.error',
			schema: {
				type: 'string'
			}
		})
		.action(include);

	// Exclude Method
	flownodes
		.method('exclude', {
			name: 'Exclude',
			description: 'Remove the selected fields from the generated output.'
		})
		.parameter('source', {
			description: 'The source object to filter.',
			type: 'object'
		})
		.parameter('fields', {
			description: 'Remove the given fields from the source. Example: ["field1", "field2", "fieldn"]',
			type: 'array',
			items: {
				type: 'string'
			}
		})
		.output('next', {
			name: 'Next',
			context: '$.filtered',
			schema: {
				type: 'object'
			}
		})
		.output('error', {
			name: 'Error',
			context: '$.error',
			schema: {
				type: 'string'
			}
		})
		.action(exclude);

	return Promise.resolve(flownodes);
}

exports = module.exports = getFlowNodes;
