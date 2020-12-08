const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('./setupElasticsearchMock');

describe('flow-node newplugin', () => {
	let plugin;
	let flowNode;
	// The client is required because it's needed in getPlugin
	var client = new ElasticsearchClient({nodes:'http://api-env:9200'}).client;
	client.isMocked = true;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'elasticsearch'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('Elasticsearch');
		});

		it('should define valid flow-nodes', () => {
			plugin.validate();
		});
	});
});
