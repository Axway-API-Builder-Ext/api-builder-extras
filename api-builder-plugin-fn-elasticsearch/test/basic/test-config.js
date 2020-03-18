const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../../src');
const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');

const { setupElasticsearchMock } = require('./setupElasticsearchMock');

const validConfig = require('../config/basic-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];
const invalidConfig = require('../config/invalid-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

describe('Basic: flow-node elasticsearch', () => {
	let runtime;
	var client = new ElasticsearchClient('http://mock-node:9200').client;
	before(async () => runtime = new MockRuntime(await getPlugin(validConfig)));
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidConfig)));

	describe('#validConfig', () => {
		it('should pass, as we have a valid config', async () => {
			setupElasticsearchMock(client, 'search', './test/mock/search_all_response.json');
			const flowNode = runtime.getFlowNode('elasticsearch');

			const result = await flowNode.search({ });
			expect(result.context.result.statusCode).to.equals(200);
		});
	});

	describe('#invalidConfig', () => {
		it('should fail, as we have an invalid config', async () => {
			const flowNode = invalidRuntime.getFlowNode('elasticsearch');

			const result = await flowNode.search({ });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Elasticsearch configuration is invalid: node is missing.');
		});
	});
});
