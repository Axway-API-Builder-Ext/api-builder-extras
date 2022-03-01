const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const fs = require('fs');
const path = require('path');
const simple = require('simple-mock');
const dotenv = require('dotenv');

describe('Integration tests', () => {
	let plugin;
	let flowNode;

	const options = {
		logger: {
			info: simple.mock().callFn((message) => console.log(message)),
			trace: simple.mock().callFn((message) => console.log(message)),
			error: simple.mock().callFn((message) => console.log(message)),
			warn: simple.mock().callFn((message) => console.log(message)),
			debug: simple.mock().callFn((message) => console.log(message))
		}
	};

	// Loads test environment variables from test/.env if the file exists
	const envFilePath = path.join(__dirname, '.env');
	if (fs.existsSync(envFilePath)) {
		dotenv.config({ path: envFilePath });
	}

	var pluginConfig = require('../../config/elasticsearch.default.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig, options);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#Index template integration test', () => {
		it('should follow the Not found path giving an unknown Index-Template name', async () => {

			const inputParameter = { name: 'doesntexists' };
			const { value, output } = await flowNode.getTemplate(inputParameter);
			expect(value).to.equal('No index template found with name [doesntexists]');
			expect(output).to.equal('notFound');
		});
		

		it('should pass with a valid template name', async () => {

			const inputParameter = { name: '.monitoring-es' };
			const { value, output } = await flowNode.getTemplate(inputParameter);

			expect(output).to.equal('next');
			expect(value.mappings).to.exist;
		});
	});

	describe('#Indices integration test', () => {
		it('should fail if the given index-template does not exist', async () => {
			const inputParameter = { index: "my_index_to_be_created", indexTemplate: "this_template_is_missing" };
			const { value, output } = await flowNode.indicesCreate(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', "The index template: 'this_template_is_missing' is missing. Index wont be created.");
			expect(output).to.equal('error');
		});

		it('should return with not found for an unknown ALIAS', async () => {

			const inputParameter = { name: "unknown-alias" };
			const { value, output } = await flowNode.indicesExists(inputParameter);

			expect(output).to.equal('notFound');
		});
	});

	describe('#Index mapping integration test', () => {
		it('should fail giving an unknown index name', async () => {
			const inputParameter = { index: 'doesntexists' };
			const { value, output } = await flowNode.getMapping(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'no such index [doesntexists]');
			expect(output).to.equal('error');
		});
	});

	describe('#Index document integration test', () => {
		it('should fail if index does not exists and cannot be created', async () => {

			const inputParameter = { index: "apigw-some-new-index", body: {message: "A document to index"}, refresh: "wait_for" };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value).to.be.instanceOf(Error);
			expect(value.message).to.contain('index_not_found_exception');
			expect(output).to.equal('error');
		});

		it('should pass without any optional parameter', async () => {
			const inputParameter = { index: "my-index", body: {message: "A document to index"} };
			const { value, output } = await flowNode.indexDocument(inputParameter);

			expect(value.result).to.equals("created");
			expect(output).to.equal('next');
		});
	});

	describe('#Search integration test', () => {
		it('should pass when having an index parameter given', async () => {
			const inputParameter = { index: 'apigw-management-kpis' };

			const { value, output } = await flowNode.search(inputParameter);
			expect(output).to.equal('missingIndex');
			expect(value.error.reason).to.equal('no such index [apigw-management-kpis]');
		});

		it('should return with no result, if the query has no hits.', async () => {
			const inputParameter = {
				index: '.monitoring-es*',
				"query": {
					"match": {
						"someField": "someValue"
					}
				}
			};
			const { value, output } = await flowNode.search(inputParameter);
			expect(output).to.equal('noResult');
		});
	});

	describe('#Rollup jobs integration test', () => {
		it('should follow notFound with an invalid Job ID', async () => {
			const inputParameter = { id: 'unknown-job' };
			const { value, output } = await flowNode.getRollupJobs(inputParameter);

			expect(output).to.equal('notFound');
		});
	});

	describe('#Transform jobs integration test', () => {
		it('should create the transform not yet exists', async () => {
			const inputParameter = { 
				transformId: 'traffic-summary-rollup-job', 
				body: JSON.parse(fs.readFileSync('./test/unit/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('next');
		});
	});

});
