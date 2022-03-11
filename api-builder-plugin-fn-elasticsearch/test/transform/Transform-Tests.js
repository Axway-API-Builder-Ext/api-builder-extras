const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');
const fs = require('fs');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Transform tests', () => {
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

	describe('#Put transform tests', () => {
		it('should fail without giving a transform id', async () => {
			const inputParameter = { };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: transformId');
			expect(output).to.equal('error');
		});

		it('should fail without giving an index template body', async () => {
			const inputParameter = { transformId: 'myJob' };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: body');
			expect(output).to.equal('error');
		});

		it('should pass - with 2 running transforms (means no actual) - Created & Started new transform', async () => {
			const mockedGetTransformStats = setupElasticsearchMock(client, 'transform.getTransformStats', './test/mock/transform/getTransformStatsResponseTwoStarted.json', false);
			const mockedStopTransform = setupElasticsearchMock(client, 'transform.stopTransform', './test/mock/transform/stopTransformResponse.json', false);
			const mockedPutTransform = setupElasticsearchMock(client, 'transform.putTransform', './test/mock/transform/putTransformResponse.json', false);
			const mockedStartTransform = setupElasticsearchMock(client, 'transform.startTransform', './test/mock/transform/startTransformResponse.json', false);
			const mockedDeleteTransform = setupElasticsearchMock(client, 'transform.deleteTransform', './test/mock/transform/stopTransformResponse.json', false);
			

			const inputParameter = { 
				transformId: 'traffic-summary-hourly', 
				idSuffix: "v1",
				body: JSON.parse(fs.readFileSync('./test/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetTransformStats.callCount).to.equals(1); // should be called once to get all running transforms
			expect(mockedStopTransform.callCount).to.equals(2); // The previously running transforms should be stopped
			expect(mockedPutTransform.callCount).to.equals(1); // a new transform should be created
			expect(mockedStartTransform.callCount).to.equals(1); // and started
			expect(mockedDeleteTransform.callCount).to.equals(0); // There is nothing to delete
		});

		it('should pass - 1 running transform (is the actual transform) - Created & Started new transform - Old stopped - Checkpoint taken over as query limition to new transform', async () => {
			const mockedGetTransformStats = setupElasticsearchMock(client, 'transform.getTransformStats', './test/mock/transform/getTransformStatsResponseOneStarted.json', false);
			const mockedPutTransform = setupElasticsearchMock(client, 'transform.putTransform', './test/mock/transform/putTransformResponse.json', false);
			const mockedDeleteTransform = setupElasticsearchMock(client, 'transform.deleteTransform', './test/mock/transform/stopTransformResponse.json', false);
			const mockedStartTransform = setupElasticsearchMock(client, 'transform.startTransform', './test/mock/transform/startTransformResponse.json', false);
			const mockedStopTransform = setupElasticsearchMock(client, 'transform.stopTransform', './test/mock/transform/stopTransformResponse.json', false);

			const inputParameter = { 
				transformId: 'traffic-summary-hourly', 
				idSuffix: "v1",
				body: JSON.parse(fs.readFileSync('./test/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetTransformStats.callCount).to.equals(1); // should be called once to get all transforms
			expect(mockedPutTransform.callCount).to.equals(1); // a new transform should be created
			// Transform body should have been extended about a query limitation
			expect(mockedPutTransform.lastCall.arg.body.source.query).to.deep.equals({ "bool": { "should": [ { "range": { "@timestamp": { "gt": 1646913600000 } } } ],"minimum_should_match": 1 } });
			expect(mockedStartTransform.callCount).to.equals(1); // and started
			expect(mockedDeleteTransform.callCount).to.equals(0); // There is nothing to delete
			expect(mockedStopTransform.callCount).to.equals(1); // There is nothing to stop
		});

		it('should pass - 1 running transform (is the actual transform) - Created & Started new transform - Old deleted - Checkpoint taken over as query limition to new transform', async () => {
			const mockedGetTransformStats = setupElasticsearchMock(client, 'transform.getTransformStats', './test/mock/transform/getTransformStatsResponseOneStarted.json', false);
			const mockedPutTransform = setupElasticsearchMock(client, 'transform.putTransform', './test/mock/transform/putTransformResponse.json', false);
			const mockedDeleteTransform = setupElasticsearchMock(client, 'transform.deleteTransform', './test/mock/transform/stopTransformResponse.json', false);
			const mockedStartTransform = setupElasticsearchMock(client, 'transform.startTransform', './test/mock/transform/startTransformResponse.json', false);
			const mockedStopTransform = setupElasticsearchMock(client, 'transform.stopTransform', './test/mock/transform/stopTransformResponse.json', false);

			const inputParameter = { 
				transformId: 'traffic-summary-hourly', 
				idSuffix: "v1",
				deletePreviousTransform: true,
				body: JSON.parse(fs.readFileSync('./test/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetTransformStats.callCount).to.equals(1); // should be called once to get all transforms
			expect(mockedPutTransform.callCount).to.equals(1); // a new transform should be created
			// Transform body should have been extended about a query limitation
			expect(mockedPutTransform.lastCall.arg.body.source.query).to.deep.equals({ "bool": { "should": [ { "range": { "@timestamp": { "gt": 1646913600000 } } } ],"minimum_should_match": 1 } });
			expect(mockedStartTransform.callCount).to.equals(1); // and started
			expect(mockedDeleteTransform.callCount).to.equals(1); // Previous transform should be deleted
			expect(mockedStopTransform.callCount).to.equals(1); // There is nothing to stop
		});

		it('should return with noUpdate as the actual transform is still indexing', async () => {
			const mockedGetTransformStats = setupElasticsearchMock(client, 'transform.getTransformStats', './test/mock/transform/getTransformStatsResponseOneIndexing.json', false);
			const mockedPutTransform = setupElasticsearchMock(client, 'transform.putTransform', './test/mock/transform/putTransformResponse.json', false);
			const mockedDeleteTransform = setupElasticsearchMock(client, 'transform.deleteTransform', './test/mock/transform/stopTransformResponse.json', false);
			const mockedStartTransform = setupElasticsearchMock(client, 'transform.startTransform', './test/mock/transform/startTransformResponse.json', false);
			const mockedStopTransform = setupElasticsearchMock(client, 'transform.stopTransform', './test/mock/transform/stopTransformResponse.json', false);

			const inputParameter = { 
				transformId: 'traffic-summary-hourly', 
				idSuffix: "v1",
				body: JSON.parse(fs.readFileSync('./test/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('noUpdate');
			expect(mockedGetTransformStats.callCount).to.equals(13); // should be called multiple times (12 + 1), while waiting for indexing to be completed
			expect(mockedPutTransform.callCount).to.equals(0); // No new transform should be created
			expect(mockedStartTransform.callCount).to.equals(0); // Nothing needs to be started
			expect(mockedDeleteTransform.callCount).to.equals(0); // There is nothing to delete
			expect(mockedStopTransform.callCount).to.equals(0); // There is nothing to stop
		}).timeout(100000);

		it('should pass with valid parameters - Transform-ID not found - Will just create new Job', async () => {
			const mockedGetTransformStats = setupElasticsearchMock(client, 'transform.getTransformStats', './test/mock/transform/getTransformStatsResponseZeroResult.json', false);
			const mockedStartTransform = setupElasticsearchMock(client, 'transform.startTransform', './test/mock/transform/startTransformResponse.json', false);
			const mockedPutTransform = setupElasticsearchMock(client, 'transform.putTransform', './test/mock/transform/putTransformResponse.json', false);

			const inputParameter = { transformId: 'myTestTransform', body: JSON.parse(fs.readFileSync('./test/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			expect(mockedGetTransformStats.callCount).to.equals(1); // should be called once to get all transforms
			expect(mockedPutTransform.callCount).to.equals(1); // a new transform should be created
			expect(mockedStartTransform.callCount).to.equals(1); // and started
			// Validate all given parameters has been passed to the JS-Elastic client
			expect(mockedPutTransform.lastCall.arg).to.deep.equals(inputParameter);
			// Make sure a body is returned
			expect(value.body).to.exist;
			expect(value.body.acknowledged).to.equal(true);
		});

		it('should create the transform not yet exists', async () => {
			const mockedGetTransformStats = setupElasticsearchMock(client, 'transform.getTransformStats', './test/mock/transform/getTransformStatsResponseZeroResult.json', false);
			const mockedPutTransform = setupElasticsearchMock(client, 'transform.putTransform', null, false);
			const mockedDeleteTransform = setupElasticsearchMock(client, 'transform.deleteTransform', './test/mock/transform/stopTransformResponse.json', false);
			const mockedStartTransform = setupElasticsearchMock(client, 'transform.startTransform', './test/mock/transform/startTransformResponse.json', false);
			const mockedStopTransform = setupElasticsearchMock(client, 'transform.stopTransform', './test/mock/transform/stopTransformResponse.json', false);

			const inputParameter = { 
				transformId: 'traffic-summary-rollup-job', 
				body: JSON.parse(fs.readFileSync('./test/mock/transform/putTransformRequestBody.json')) };
			const { value, output } = await flowNode.putTransform(inputParameter);

			expect(output).to.equal('next');
			expect(mockedGetTransformStats.callCount).to.equals(1);
			expect(mockedPutTransform.callCount).to.equals(1);
			expect(mockedDeleteTransform.callCount).to.equals(0);
			expect(mockedStartTransform.callCount).to.equals(1);
			expect(mockedStopTransform.callCount).to.equals(0);
		});
	});
});
