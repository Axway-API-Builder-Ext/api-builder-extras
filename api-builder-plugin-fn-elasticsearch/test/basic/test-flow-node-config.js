const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../../src');
const actions = require('../../src/actions/search');

const pluginConfig = require('../config/basic-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

describe('Basic: flow-node elasticsearch', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin(pluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.search).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('elasticsearch');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flownode.name).to.equal('Elasticsearch');
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});
});
