const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Template mapping tests', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'http://api-env:9200'}).client;
	client.isMocked = true;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#Get mapping tests', () => {
		it('should fail without giving an index name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.getMapping(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: index');
			expect(output).to.equal('error');
		});

		it('should fail giving an unknown index name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.getMapping', './test/mock/indexMappings/getMappingUnknownIndexResponse.json', false);

			const inputParameter = { index: 'doesntexists' };
			const { value, output } = await flowNode.getMapping(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'No mapping found for index [doesntexists]');
			expect(output).to.equal('error');
			expect(mockedFn.callCount).to.equals(1);
		});

		it('should pass without with a valid index name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.getMapping', './test/mock/indexMappings/getMappingResponse.json', false);

			const inputParameter = { index: 'apigw-traffic-summary-00*' };
			const { value, output } = await flowNode.getMapping(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure a body is returned
			expect(value.body).to.exist;
		});
	});

	describe('#Put mapping tests', () => {
		it('should fail without giving an index name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.putMapping(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: index');
			expect(output).to.equal('error');
		});

		it('should fail without giving a mapping body', async () => {
			const inputParameter = { index: 'myIndex' };
			const { value, output } = await flowNode.putMapping(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: body');
			expect(output).to.equal('error');
		});

		it('should pass without with valid parameters', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.putMapping', './test/mock/indexMappings/putMappingResponse.json', false);

			const inputParameter = { index: 'apigw-traffic-summary-000001', body: JSON.parse(fs.readFileSync('./test/mock/indexMappings/putMappingRequestBody.json')) };
			const { value, output } = await flowNode.putMapping(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure a body is returned
			expect(value.body).to.exist;
		});
	});
});
