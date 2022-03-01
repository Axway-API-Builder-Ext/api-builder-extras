const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Template indices tests', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'http://api-env:9200'}).client;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];
	pluginConfig.validateConnection = false;

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#Get legacy index template actions', () => {
		it('should fail without giving an index template name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.getTemplate(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: name');
			expect(output).to.equal('error');
		});

		it('should follow the Not found path giving an unknown Index-Template name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.getTemplate', './test/unit/mock/indexTemplates/getTemplateUnknownTemplateResponse.json', false);

			const inputParameter = { name: 'doesntexists' };
			const { value, output } = await flowNode.getTemplate(inputParameter);
			expect(value).to.equal('No index template found with name [doesntexists]');
			expect(output).to.equal('notFound');
			expect(mockedFn.callCount).to.equals(1);
		});

		it('should pass with a valid template name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.getTemplate', './test/unit/mock/indexTemplates/getTemplateResponse.json', false);

			const inputParameter = { name: 'traffic-summary' };
			const { value, output } = await flowNode.getTemplate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure mappings are is returned
			expect(value.mappings).to.exist;
		});
	});

	describe('#Put legacy index template actions', () => {
		it('should fail without giving an index template name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: name');
			expect(output).to.equal('error');
		});

		it('should fail without giving an index template body', async () => {
			const inputParameter = { name: 'myIndexTemplate' };
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: body');
			expect(output).to.equal('error');
		});

		it('should pass with valid parameters - Version check is disabled', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.putTemplate', './test/unit/mock/indexTemplates/putTemplateResponse.json', false);

			const inputParameter = { name: 'test-index-template', body: JSON.parse(fs.readFileSync('./test/unit/mock/indexTemplates/putTemplateRequestBody.json')), create: true };
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure a body is returned
			expect(value.body).to.exist;
		});

		it('should update index template if version number is higher / existing ILM policy should be taken over', async () => {
			// Response finally returned, when the index with version 2 has been created (can be generic, as the PUT-Response doesn't contain the version number)
			const mockedPutTemplate = setupElasticsearchMock(client, 'indices.putTemplate', './test/unit/mock/indexTemplates/putTemplateResponse.json', false);
			// Implementation will try to find the existing template - This is the response with version 1
			const mockedGetTemplate = setupElasticsearchMock(client, 'indices.getTemplate', './test/unit/mock/indexTemplates/getTemplateResponseVersion1.json', false);

			const inputParameter = { 
				name: 'traffic-summary', 
				updateWhenChanged: true,
				body: JSON.parse(fs.readFileSync('./test/unit/mock/indexTemplates/putTemplateRequestBodyVersion2.json')), create: true 
			};
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedPutTemplate.callCount).to.equals(1);
			expect(mockedPutTemplate.lastCall.arg.body.version).to.equals(2); // Make sure version 2 is given
			expect(mockedPutTemplate.lastCall.arg.body.aliases['apigw-traffic-summary']).to.exist; // Validate the existing mapping is returned
			expect(mockedPutTemplate.lastCall.arg.body.settings.index.lifecycle).to.deep.equals({name: "logstash-policy", rollover_alias: "apigw-traffic-summary"}); // Validate the existing mapping is returned
			// Make sure a body is returned
			expect(value.body).to.exist;
		});

		it('should NOT update index template if desired version number equals or less than actual', async () => {
			// Mock putTemplate to make sure it is not called
			const mockedPutTemplate = setupElasticsearchMock(client, 'indices.putTemplate', './test/unit/mock/indexTemplates/putTemplateResponse.json', false);
			// Implementation will try to find the existing template - This is the response with version 1
			const mockedFn2 = setupElasticsearchMock(client, 'indices.getTemplate', './test/unit/mock/indexTemplates/getTemplateResponse.json', false);

			const inputParameter = { 
				name: 'traffic-summary', 
				updateWhenChanged: true,
				body: JSON.parse(fs.readFileSync('./test/unit/mock/indexTemplates/putTemplateRequestBody.json')), create: true 
			};
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(output).to.equal('noUpdate');
			expect(mockedPutTemplate.callCount).to.equals(0); // putTemplate should not have been called
		});

		it('should update the index template if there is no actual index template', async () => {
			// Mock putTemplate to make sure it is not called
			const mockedPutTemplate = setupElasticsearchMock(client, 'indices.putTemplate', './test/unit/mock/indexTemplates/putTemplateResponse.json', false);
			// Implementation will try to find the existing template - This is the response with version 1
			const mockedGetTemplate = setupElasticsearchMock(client, 'indices.getTemplate', './test/unit/mock/indexTemplates/getTemplateUnknownTemplateResponse.json', false);

			const inputParameter = { 
				name: 'does-not-exists', 
				updateWhenChanged: true,
				body: JSON.parse(fs.readFileSync('./test/unit/mock/indexTemplates/putTemplateRequestBody.json')), create: true 
			};
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedPutTemplate.callCount).to.equals(1);
		});

		it('should update anyway, if recreate is set', async () => {
			// Mock putTemplate which is called
			const mockedPutTemplate = setupElasticsearchMock(client, 'indices.putTemplate', './test/unit/mock/indexTemplates/putTemplateResponse.json', false);
			// Implementation will try to find the existing template - This is the response with version 1
			const mockedFn2 = setupElasticsearchMock(client, 'indices.getTemplate', './test/unit/mock/indexTemplates/getTemplateResponseVersion2.json', false);

			const inputParameter = { 
				name: 'traffic-summary', 
				updateWhenChanged: true,
				recreate: true,
				body: JSON.parse(fs.readFileSync('./test/unit/mock/indexTemplates/putTemplateRequestBodyVersion2.json')), create: true 
			};
			const { value, output } = await flowNode.putTemplate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedPutTemplate.callCount).to.equals(1); // putTemplate should not have been called
			expect(mockedPutTemplate.lastCall.arg.body.version).to.equals(2); // Make sure version 2 is given
		});
	});
});
