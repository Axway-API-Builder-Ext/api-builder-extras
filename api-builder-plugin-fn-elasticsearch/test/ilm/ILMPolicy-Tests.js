const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('ILM Policy tests', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'http://api-env:9200'}).client;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#Get ILM Policy tests', () => {
		it('should fail without giving a policy name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.getILMPolicy(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: policy');
			expect(output).to.equal('error');
		});

		it('should follow notFound with an invalid policy name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'ilm.getLifecycle', './test/mock/ilm/getILMPolicyNotFoundResponse.json', false);
			const inputParameter = { policy: 'unknown-policy' };
			const { value, output } = await flowNode.getILMPolicy(inputParameter);

			expect(output).to.equal('notFound');
		});

		it('should pass with a valid policy-name and body', async () => {
			const mockedFn = setupElasticsearchMock(client, 'ilm.getLifecycle', './test/mock/ilm/getILMPolicyResponse.json', false);
			const inputParameter = { policy: 'logstash-policy' };
			const { value, output } = await flowNode.getILMPolicy(inputParameter);

			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure mappings are is returned
			expect(value.policy).to.exist;
		});
	});

	describe('#Put legacy index template actions', () => {
		it('should fail without giving a polic name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: policy');
			expect(output).to.equal('error');
		});

		it('should fail without giving an index template body', async () => {
			const inputParameter = { policy: 'myIndexTemplate' };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: body');
			expect(output).to.equal('error');
		});

		it('should pass without with valid parameters', async () => {
			const mockedFn = setupElasticsearchMock(client, 'ilm.putLifecycle', './test/mock/ilm/putILMPolicyResponse.json', false);

			const inputParameter = { policy: 'test-index-template', body: JSON.parse(fs.readFileSync('./test/mock/ilm/putILMPolicyRequestBody.json')) };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

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
