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
			const inputParameter = { policy: 'test-ilm-policy' };
			const { value, output } = await flowNode.getILMPolicy(inputParameter);

			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure mappings are is returned
			expect(value.policy).to.exist;
		});
	});

	describe('#Put ILM policy actions', () => {
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

			const inputParameter = { policy: 'test-ilm-policy', body: JSON.parse(fs.readFileSync('./test/mock/ilm/putILMPolicyRequestBody.json')) };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure a body is returned
			expect(value.body).to.exist;
		});
		
		it('should return with noUpate, if updateWhenChanged is given and policies are equal', async () => {
			// This method is used by the implementation to load the actual ILM-Policy
			const mockedGetILMPolicy = setupElasticsearchMock(client, 'ilm.getLifecycle', './test/mock/ilm/getILMPolicyResponse.json', false);

			const inputParameter = { 
				policy: 'test-ilm-policy', 
				body: JSON.parse(fs.readFileSync('./test/mock/ilm/putILMPolicyRequestBody.json')), 
				updateWhenChanged: true
			 };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(output).to.equal('noUpdate');
			expect(value).to.equal('No update required as desired ILM-Policy equals to existing policy.');
			expect(mockedGetILMPolicy.callCount).to.equals(1);
		});

		it('should update the ILM-Policy if given policy is different', async () => {
			// This method is used by the implementation to load the actual ILM-Policy
			const mockedGetILMPolicy = setupElasticsearchMock(client, 'ilm.getLifecycle', './test/mock/ilm/getILMPolicyResponse.json', false);
			const mockedPutILMPolicy = setupElasticsearchMock(client, 'ilm.putLifecycle', './test/mock/ilm/putILMPolicyResponse.json', false);

			var testILMPolicy = JSON.parse(fs.readFileSync('./test/mock/ilm/putILMPolicyRequestBody.json'));
			testILMPolicy.policy.phases.hot.min_age = "30d"
			const inputParameter = { 
				policy: 'test-ilm-policy', 
				body: testILMPolicy, 
				updateWhenChanged: true
			 };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetILMPolicy.callCount).to.equals(1);
			expect(mockedPutILMPolicy.callCount).to.equals(1);
		});

		it('should create the ILM-Policy if the actual policy does not exists', async () => {
			// This method is used by the implementation to load the actual ILM-Policy
			const mockedGetILMPolicy = setupElasticsearchMock(client, 'ilm.getLifecycle', './test/mock/ilm/getILMPolicyNotFoundResponse.json', false);
			const mockedPutILMPolicy = setupElasticsearchMock(client, 'ilm.putLifecycle', './test/mock/ilm/putILMPolicyResponse.json', false);

			const inputParameter = { 
				policy: 'test-ilm-policy', 
				body: JSON.parse(fs.readFileSync('./test/mock/ilm/putILMPolicyRequestBody.json')), 
				updateWhenChanged: true
			 };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetILMPolicy.callCount).to.equals(1);
			expect(mockedPutILMPolicy.callCount).to.equals(1);
		});

		it('should attach the created ILM Policy to an index template.', async () => {
			// This method is used by the implementation to load the actual ILM-Policy
			const mockedGetILMPolicy = setupElasticsearchMock(client, 'ilm.getLifecycle', './test/mock/ilm/getILMPolicyNotFoundResponse.json', false);
			const mockedPutILMPolicy = setupElasticsearchMock(client, 'ilm.putLifecycle', './test/mock/ilm/putILMPolicyResponse.json', false);
			const mockedPutTemplate = setupElasticsearchMock(client, 'indices.putTemplate', './test/mock/indexTemplates/putTemplateResponse.json', false);
			const mockedGetTemplate = setupElasticsearchMock(client, 'indices.getTemplate', './test/mock/indexTemplates/getTemplateResponse.json', false);

			const inputParameter = { 
				policy: 'test-ilm-policy', 
				body: JSON.parse(fs.readFileSync('./test/mock/ilm/putILMPolicyRequestBody.json')), 
				updateWhenChanged: true, 
				attachToIndexTemplate: "traffic-summary:11111,audit"
			 };
			const { value, output } = await flowNode.putILMPolicy(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetILMPolicy.callCount).to.equals(1);
			expect(mockedPutILMPolicy.callCount).to.equals(1);
			expect(mockedGetTemplate.callCount).to.equals(2);
			expect(mockedPutTemplate.callCount).to.equals(1); // Only one, as the audit template is not returned
			expect(mockedPutTemplate.lastCall.arg.body.settings.index.lifecycle.name).to.equals("test-ilm-policy");
			expect(mockedPutTemplate.lastCall.arg.body.settings.index.lifecycle.rollover_alias).to.equals("11111");
		});

	});
});
