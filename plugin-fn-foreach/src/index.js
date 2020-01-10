const sdk = require('axway-flow-sdk');
const action = require('./action');

function getFlowNodes() {
	const flownodes = sdk.init(module);

	flownodes.add('foreach', {
		category: 'extension',
		name: 'For Each',
		icon: 'icon.svg',
		description: 'Loop over items and execute specified flow.'
	})
		.method('flowforeach', {
			name: 'Flow',
			description: 'Execute a flow for each item.'
		})
		.parameter('flow', {
			description: 'The flow to execute.',
			type: 'string'
		}, true)
		.parameter('items', {
			description: 'The list of inputs to the flow.',
			type: 'array'
		}, true)
		.output('next', {
			name: 'Next',
			description: 'The list of results',
			context: '$.results',
			schema: {
				type: 'array'
			}
		})
		.output('flowNotFound', {
			name: 'Flow not found',
			context: '$.error',
			schema: {
				type: 'string'
			}
		})
		.output('error', {
			name: 'Error',
			context: '$.error',
			schema: {}
		})
		.action(action);

	return Promise.resolve(flownodes);
}

exports = module.exports = getFlowNodes;
