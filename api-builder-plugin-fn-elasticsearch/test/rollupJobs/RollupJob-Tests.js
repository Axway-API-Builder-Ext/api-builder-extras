const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Rollup Job tests', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'http://api-env:9200'}).client;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#Get Rollup jobs tests', () => {
		it('should fail without giving a job ID', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.getRollupJobs(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: id');
			expect(output).to.equal('error');
		});

		it('should follow notFound with an invalid Job ID', async () => {
			const mockedFn = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsNotFoundResponse.json', false);
			const inputParameter = { id: 'unknown-job' };
			const { value, output } = await flowNode.getRollupJobs(inputParameter);

			expect(output).to.equal('notFound');
		});

		it('should pass with a valid Job ID', async () => {
			const mockedFn = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsResponse.json', false);
			const inputParameter = { id: 'traffic-summary-rollup-job' };
			const { value, output } = await flowNode.getRollupJobs(inputParameter);

			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure mappings are is returned
			expect(value.config).to.exist;
			expect(value.config.id).to.equal('traffic-summary-rollup-job');
		});
	});

	describe('#Put Rollup job tests', () => {
		it('should fail without giving a job id', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: id');
			expect(output).to.equal('error');
		});

		it('should fail without giving an index template body', async () => {
			const inputParameter = { id: 'myJob' };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: body');
			expect(output).to.equal('error');
		});

		it('should pass without with valid parameters', async () => {
			const mockedFn = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);

			const inputParameter = { id: 'myTestJob', body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedFn.callCount).to.equals(1);
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure a body is returned
			expect(value.body).to.exist;
			expect(value.body.acknowledged).to.equal(true);
			
		});
	});
});
