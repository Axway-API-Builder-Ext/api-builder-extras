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
	pluginConfig.validateConnection = false;

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

		it('should fail if the same job-id is re-used, but no ID-Suffix is given.', async () => {
			const mockedGetRollupJob = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsResponse.json', false);
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);

			const inputParameter = { id: 'traffic-summary-rollup-job', body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Cannot replace existing Rollup job using the same Job-ID: \'traffic-summary-rollup-job\'. Please provide an ID-Suffix.');
			expect(output).to.equal('error');
		});

		it('should pass - with 2 running jobs (means no actual) - Created & Started new Job', async () => {
			const mockedGetRollupJobs = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getTwoStartedRollupJobsResponse.json', false);
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedDeleteRollupJob = setupElasticsearchMock(client, 'rollup.deleteJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedStartRollupJob = setupElasticsearchMock(client, 'rollup.startJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedStopRollupJob = setupElasticsearchMock(client, 'rollup.stopJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);

			const inputParameter = { 
				id: 'traffic-summary-rollup', 
				idSuffix: "v1",
				body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetRollupJobs.callCount).to.equals(1); // should be called once to get all running jobs
			expect(mockedPutRollupJob.callCount).to.equals(1); // a new job should be created
			expect(mockedStartRollupJob.callCount).to.equals(1); // and started
			expect(mockedDeleteRollupJob.callCount).to.equals(0); // There is nothing to delete
			expect(mockedStopRollupJob.callCount).to.equals(2); // The previously running jobs should be stopped
		});

		it('should pass - 1 running job (is the actual job) - Created & Started new Job - Old stopped', async () => {
			const mockedGetRollupJobs = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getOneStartedRollupJobsResponse.json', false);
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedDeleteRollupJob = setupElasticsearchMock(client, 'rollup.deleteJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedStartRollupJob = setupElasticsearchMock(client, 'rollup.startJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedStopRollupJob = setupElasticsearchMock(client, 'rollup.stopJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);

			const inputParameter = { 
				id: 'traffic-summary-rollup', 
				idSuffix: "v1",
				body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetRollupJobs.callCount).to.equals(1); // should be called once to get all running jobs
			expect(mockedPutRollupJob.callCount).to.equals(1); // a new job should be created
			expect(mockedStartRollupJob.callCount).to.equals(1); // and started
			expect(mockedDeleteRollupJob.callCount).to.equals(0); // There is nothing to delete
			expect(mockedStopRollupJob.callCount).to.equals(1); // There is nothing to stop
		});

		it('should pass with valid parameters - Job-ID not found - Will just create new Job', async () => {
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

		it('should result in NoUpdate if the Rollup-Job config is unchanged', async () => {
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedGetRollupJob = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsResponse.json', false);

			const inputParameter = { 
				id: 'traffic-summary-rollup-job', 
				replaceWhenChanged: true,
				body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('noUpdate');
			expect(value).to.equal('No update required as desired Rollup-Job with new ID: \'traffic-summary-rollup-job\' equals to existing job with ID: \'traffic-summary-rollup-job\'.');
			expect(mockedPutRollupJob.callCount).to.equals(0);
		});

		it('should update/recreate the job if configuration is changed', async () => {
			const mockedDeleteRollupJob = setupElasticsearchMock(client, 'rollup.deleteJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedGetRollupJob = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsResponse.json', false);
			const mockedStopRollupJob = setupElasticsearchMock(client, 'rollup.stopJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedStartRollupJob = setupElasticsearchMock(client, 'rollup.startJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);

			var rollupJobConfig = JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json'))
			rollupJobConfig.page_size = 500;
			const inputParameter = { 
				id: 'traffic-summary-rollup-job', 
				idSuffix: 'v1', 
				replaceWhenChanged: true,
				body: rollupJobConfig };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetRollupJob.callCount).to.equals(1);
			expect(mockedPutRollupJob.callCount).to.equals(1);
			expect(mockedDeleteRollupJob.callCount).to.equals(0);
			expect(mockedStopRollupJob.callCount).to.equals(1);
			expect(mockedStartRollupJob.callCount).to.equals(1);
			// Additionally in this test make sure, the internal API-Params are removed and NOT send to ES
			inputParameter.id = `${inputParameter.id}-${inputParameter.idSuffix}`;
			delete inputParameter.replaceWhenChanged;
			delete inputParameter.idSuffix;
			expect(mockedPutRollupJob.lastCall.arg).to.deep.equals(inputParameter);
		});

		it('should update/recreate the job if not yet exists', async () => {
			const mockedDeleteRollupJob = setupElasticsearchMock(client, 'rollup.deleteJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);
			const mockedGetRollupJob = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsNotFoundResponse.json', false);
			const mockedStartRollupJob = setupElasticsearchMock(client, 'rollup.startJob', './test/mock/rollupJobs/putRollupJobResponse.json', false);

			const inputParameter = { 
				id: 'traffic-summary-rollup-job', 
				replaceWhenChanged: true,
				body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetRollupJob.callCount).to.equals(1);
			expect(mockedPutRollupJob.callCount).to.equals(1);
			expect(mockedDeleteRollupJob.callCount).to.equals(0);
			expect(mockedStartRollupJob.callCount).to.equals(1);
		});

		it('should gracefully handle the JOB-ID already exists response', async () => {
			const mockedPutRollupJob = setupElasticsearchMock(client, 'rollup.putJob', './test/mock/rollupJobs/putRollupJobAlreadyExistsResponse.json', true);
			const mockedGetRollupJob = setupElasticsearchMock(client, 'rollup.getJobs', './test/mock/rollupJobs/getRollupJobsNotFoundResponse.json', false);

			const inputParameter = { 
				id: 'lets-suppose-this-is-a-new-id', 
				replaceWhenChanged: true,
				body: JSON.parse(fs.readFileSync('./test/mock/rollupJobs/putRollupJobRequestBody.json')) };
			const { value, output } = await flowNode.putRollupJob(inputParameter);

			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Error creating the rollup job. The rollup job id: \'lets-suppose-this-is-a-new-id\' was used previously. This includes deleted jobs.');
			expect(mockedGetRollupJob.callCount).to.equals(1);
			expect(mockedPutRollupJob.callCount).to.equals(1);
		});
	});
});
