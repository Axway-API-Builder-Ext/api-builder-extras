const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Index document tests', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'https://mock-node:9200'}).client;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];
	pluginConfig.validateConnection = false;

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#Index document actions', () => {
		it('should fail without giving an index name', async () => {
			const inputParameter = { index: null, body: null };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: index');
			expect(output).to.equal('error');
		});

		it('should fail without giving a body to index', async () => {
			const inputParameter = { index: "my_index", body: null };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: body');
			expect(output).to.equal('error');
		});

		it('should pass without any optional parameter', async () => {
			const mockedFn = setupElasticsearchMock(client, 'index', './test/mock/indexDocument/document-indexed-response.json');

			const inputParameter = { index: "my-index", body: {message: "A document to index"} };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value.statusCode).to.equals(201);
			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
		});

		it('should pass with some of the optional parameters', async () => {
			const mockedFn = setupElasticsearchMock(client, 'index', './test/mock/indexDocument/document-indexed-response.json');

			const inputParameter = { index: "my-index", body: {message: "A document to index"}, refresh: "wait_for" };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value.statusCode).to.equals(201);
			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
		});

		it('should fail if index does not exists and cannot be created', async () => {
			const mockedFn = setupElasticsearchMock(client, 'index', './test/mock/indexDocument/missing-index-response.json');

			const inputParameter = { index: "apigw-some-new-index", body: {message: "A document to index"}, refresh: "wait_for" };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value).to.be.instanceOf(Error);
			expect(value.message).to.contain('index_not_found_exception');
			expect(output).to.equal('error');
		});

		it('should add the current epoch timestamp into the given timestamp field', async () => {
			const mockedFn = setupElasticsearchMock(client, 'index', './test/mock/indexDocument/document-indexed-response.json');

			const inputParameter = { index: "my-index", body: {message: "A document to index"}, refresh: "wait_for", addTimestamp: "@timestamp" };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			delete inputParameter.addTimestamp; // Not expected to be send to ES

			expect(value.statusCode).to.equals(201);
			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			expect(mockedFn.lastCall.arg.body).to.have.property("@timestamp");
			expect(mockedFn.lastCall.arg).not.to.have.property("addTimestamp");
		});
	});
});
