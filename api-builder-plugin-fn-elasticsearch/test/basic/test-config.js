const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('./setupElasticsearchMock');

const validConfig = require('../config/basic-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];
const invalidConfig = require('../config/invalid-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

describe('Basic: flow-node elasticsearch', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient('http://mock-node:9200').client;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, validConfig);
		invalidPlugin = await MockRuntime.loadPlugin(getPlugin, invalidConfig);
		plugin.setOptions({ validateOutputs: true });
	});

	//////////////
	/*let runtime;
	var client = new ElasticsearchClient('http://mock-node:9200').client;
	before(async () => runtime = new MockRuntime(await getPlugin(validConfig)));
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidConfig)));
*/
	describe('#validConfig', () => {
		it('should pass, as we have a valid config', async () => {
			flowNode = plugin.getFlowNode('elasticsearch');
			setupElasticsearchMock(client, 'search', './test/mock/search_all_response.json');

			const { value, output } = await flowNode.search({ });

			expect(output).to.equal('next');
			expect(value.statusCode).to.equals(200);
		});
	});

	describe('#invalidConfig', () => {
		it('should fail, as we have an invalid config', async () => {
			flowNode = invalidPlugin.getFlowNode('elasticsearch');

			const { value, output } = await flowNode.search({ });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Elasticsearch configuration is invalid: node is missing.');
			expect(output).to.equal('error');
		});
	});
});
