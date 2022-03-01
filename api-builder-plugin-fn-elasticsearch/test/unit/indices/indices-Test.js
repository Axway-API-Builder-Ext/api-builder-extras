const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Indices rollover tests', () => {
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

	describe('#Rollover index tests', () => {
		it('should fail without giving an alias', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.indicesRollover(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: alias');
			expect(output).to.equal('error');
		});

		it('should pass with with a valid alias name', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.rollover', './test/unit/mock/indices/rolloverResponse.json', false);

			const inputParameter = { alias: 'apigw-traffic-summary' };
			const { value, output } = await flowNode.indicesRollover(inputParameter);

			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
		});

		it('should pass when the alias is an object containing the aliases', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.rollover', './test/unit/mock/indices/rolloverResponse.json', false);

			const inputParameter = { alias: { "apigw-traffic-summary" :{ } } };
			const { value, output } = await flowNode.indicesRollover(inputParameter);

			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			// Given object should be translated into a single alias string
			expect(mockedFn.lastCall.arg).to.deep.equals({ alias: 'apigw-traffic-summary' });
		});

		it('should pass if the alias is a wildcard - Should rollover all indicies', async () => {
			const mockedIndicesGetAliasResponse = setupElasticsearchMock(client, 'indices.getAlias', './test/unit/mock/indices/twoIndicesForAliasFoundResponse.json', false);
			const mockedRolloverResponse = setupElasticsearchMock(client, 'indices.rollover', './test/unit/mock/indices/rolloverResponse.json', false);
			// 

			const inputParameter = { alias: 'apigw-traffic-summary', wildcardAlias: true };
			const { value, output } = await flowNode.indicesRollover(inputParameter);
			expect(output).to.equal('next');
			expect(mockedIndicesGetAliasResponse.callCount).to.equals(1);
			expect(mockedRolloverResponse.callCount).to.equals(2);
			// Given object should be translated into a single alias string
			expect(mockedRolloverResponse.lastCall.arg).to.deep.equals({ alias: 'apigw-traffic-summary-us-dc1' });
		});

		it('should gracefully handle, if the alias object is empty', async () => {
			const mockedFn = setupElasticsearchMock(client, 'indices.rollover', './test/unit/mock/indices/rolloverResponse.json', false);

			const inputParameter = { alias: { } };
			const { value, output } = await flowNode.indicesRollover(inputParameter);

			expect(output).to.equal('error');
			expect(mockedFn.callCount).to.equals(0);
			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'No index found to rollover for alias: {}');
		});
	});

	describe('#Create index tests', () => {
		it('should fail without giving an index name', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: index');
			expect(output).to.equal('error');
		});

		it('should pass when the index is created', async () => {
			const mockedIndicesCreate = setupElasticsearchMock(client, 'indices.create', './test/unit/mock/indices/indexCreatedResponse.json', false);

			const inputParameter = { index: "my_index_to_be_created" };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedIndicesCreate.callCount).to.equals(1);
		});

		it('should should add the alias name to the index config', async () => {
			const mockedIndicesCreate = setupElasticsearchMock(client, 'indices.create', './test/unit/mock/indices/indexCreatedResponse.json', false);

			const inputParameter = { index: "my_index_to_be_created", alias: "alias_for_my_index" };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedIndicesCreate.callCount).to.equals(1);
			expect(mockedIndicesCreate.lastCall.arg.body.aliases["alias_for_my_index"]).to.be.a('object');
		});

		it('should should merge the alias into a given index config (not having aliases)', async () => {
			const mockedIndicesCreate = setupElasticsearchMock(client, 'indices.create', './test/unit/mock/indices/indexCreatedResponse.json', false);

			const inputParameter = { index: "my_index_to_be_created", alias: "alias_for_my_index", body: { settings: { number_of_shards: 1 }, mappings: { properties: { field1: { type: "text" } } } } };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedIndicesCreate.callCount).to.equals(1);
			expect(mockedIndicesCreate.lastCall.arg.body.aliases["alias_for_my_index"]).to.be.a('object');
			expect(mockedIndicesCreate.lastCall.arg.body.settings["number_of_shards"]).to.equal(1);
		});

		it('should should merge the alias into a given index config (already having some aliases)', async () => {
			const mockedIndicesCreate = setupElasticsearchMock(client, 'indices.create', './test/unit/mock/indices/indexCreatedResponse.json', false);

			const inputParameter = { index: "my_index_to_be_created", alias: "alias_for_my_index", body: { aliases: { existingAlias: {} }, settings: { number_of_shards: 1 }, mappings: { properties: { field1: { type: "text" } } } } };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedIndicesCreate.callCount).to.equals(1);
			expect(mockedIndicesCreate.lastCall.arg.body.aliases["alias_for_my_index"]).to.be.a('object');
			expect(mockedIndicesCreate.lastCall.arg.body.aliases["existingAlias"]).to.be.a('object');
			expect(mockedIndicesCreate.lastCall.arg.body.settings["number_of_shards"]).to.equal(1);
		});

		it('should fail if the given index-template does not exist', async () => {
			const mockedIndexTemplateExists = setupElasticsearchMock(client, 'indices.existsTemplate', './test/unit/mock/indexTemplates/indexTemplateNotExistsResponse.json', false);

			const inputParameter = { index: "my_index_to_be_created", indexTemplate: "this_template_is_missing" };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', "The index template: 'this_template_is_missing' is missing. Index wont be created.");
			expect(output).to.equal('error');
			expect(mockedIndexTemplateExists.callCount).to.equals(1);
		});

		it('should pass when the index is created including a given index_template name', async () => {
			const mockedIndexTemplateExists = setupElasticsearchMock(client, 'indices.existsTemplate', './test/unit/mock/indexTemplates/indexTemplateExistsResponse.json', false);
			const mockedIndicesCreate = setupElasticsearchMock(client, 'indices.create', './test/unit/mock/indices/indexCreatedResponse.json', false);

			const inputParameter = { index: "my_index_to_be_created", indexTemplate: "management-kpis"  }; 
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(output).to.equal('next');
			expect(mockedIndexTemplateExists.callCount).to.equals(1);
			expect(mockedIndicesCreate.callCount).to.equals(1);
		});
	});

	describe('#Index exists tests', () => {
		it('should fail without giving an index name and alias', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Either the parameter index, name (name of the alias) or both must be given');
			expect(output).to.equal('error');
		});

		it('should pass when the index name is given', async () => {
			const mockedAliasExists = setupElasticsearchMock(client, 'indices.existsAlias', './test/unit/mock/dummy.json', false);
			const mockedIndicesExists = setupElasticsearchMock(client, 'indices.exists', './test/unit/mock/indices/indexExistsResponse.json', false);

			const inputParameter = { index: "apigw-monitoring-000001" };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(output).to.equal('next');
			expect(mockedIndicesExists.callCount).to.equals(1);
			expect(mockedAliasExists.callCount).to.equals(0);
		});

		it('should return with not found for an unknown INDEX', async () => {
			const mockedAliasExists = setupElasticsearchMock(client, 'indices.existsAlias', './test/unit/mock/indices/indexNotfoundResponse.json', false);
			const mockedIndicesExists = setupElasticsearchMock(client, 'indices.exists', './test/unit/mock/dummy.json', false);

			const inputParameter = { name: "unknown-alias" };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(output).to.equal('notFound');
			expect(mockedAliasExists.callCount).to.equals(1);
			expect(mockedIndicesExists.callCount).to.equals(0);
		});
		

		it('should pass when the ALIAS name is given', async () => {
			const mockedAliasExists = setupElasticsearchMock(client, 'indices.existsAlias', './test/unit/mock/indices/aliasExistsResponse.json', false);
			const mockedIndicesExists = setupElasticsearchMock(client, 'indices.exists', './test/unit/mock/dummy.json', false);

			const inputParameter = { name: "apigw-monitoring" };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(output).to.equal('next');
			expect(mockedAliasExists.callCount).to.equals(1);
			expect(mockedIndicesExists.callCount).to.equals(0);
		});

		it('should return with not found for an unknown ALIAS', async () => {
			const mockedAliasExists = setupElasticsearchMock(client, 'indices.existsAlias', './test/unit/mock/indices/aliasNotfoundResponse.json', false);
			const mockedIndicesExists = setupElasticsearchMock(client, 'indices.exists', './test/unit/mock/dummy.json', false);

			const inputParameter = { name: "unknown-alias" };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(output).to.equal('notFound');
			expect(mockedAliasExists.callCount).to.equals(1);
			expect(mockedIndicesExists.callCount).to.equals(0);
		});

		it('should pass when the INDEX name is given', async () => {
			const mockedAliasExists = setupElasticsearchMock(client, 'indices.existsAlias', './test/unit/mock/indices/aliasExistsResponse.json', false);
			const mockedIndicesExists = setupElasticsearchMock(client, 'indices.exists', './test/unit/mock/indices/indexExistsResponse.json', false);

			const inputParameter = { index: "apigw-monitoring" };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(output).to.equal('next');
			expect(mockedAliasExists.callCount).to.equals(0);
			expect(mockedIndicesExists.callCount).to.equals(1);
		});
	});
});
