const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Template indices tests', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'http://api-env:9200'}).client;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

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
			const mockedFn = setupElasticsearchMock(client, 'indices.getTemplate', './test/mock/indexTemplates/getTemplateUnknownTemplateResponse.json', false);

			const inputParameter = { name: 'doesntexists' };
			const { value, output } = await flowNode.getTemplate(inputParameter);
			expect(value).to.equal('No index template found with name [doesntexists]');
			expect(output).to.equal('notFound');
			expect(mockedFn.callCount).to.equals(1);
		});

		it('should pass without with a valid template name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.getTemplate', './test/mock/indexTemplates/getTemplateResponse.json', false);

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

		it('should pass without with valid parameters', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.putTemplate', './test/mock/indexTemplates/putTemplateResponse.json', false);

			const inputParameter = { name: 'test-index-template', body: JSON.parse(fs.readFileSync('./test/mock/indexTemplates/putTemplateRequestBody.json')), create: true };
			const { value, output } = await flowNode.putTemplate(inputParameter);

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
