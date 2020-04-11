const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../src');
const actions = require('../src/actions');

const validPluginConfig = require('./config/aws-lambda.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-aws-lambda'];
const invalidPluginConfig = require('./config/aws-lambda.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-aws-lambda'];

describe('flow-node lambda', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.invokeLambda).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('lambda');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flownode.name).to.equal('AWS Lambda');
			expect(flownode.description).to.equal('Invokes an AWS Lambda function. Read more: https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html');
			expect(flownode.icon).to.be.a('string');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#invokeLambda', () => {
		it('should error when missing parameter', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			const result = await flowNode.invokeLambda({
				name: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: func');
		});

		it('should succeed with valid JavaScript argument.', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			simple.mock(runtime.plugin.flownodes.lambda.lambdaClient, 'invoke').callFn(function (params, callback) {
				expect(params).to.be.an('Object');
				expect(params.FunctionName).to.equals('greeting');
				expect(params.Payload).to.be.an('string');
				expect(params.Payload).to.deep.equal(JSON.stringify({key1: 'JavaScript-Object', key2: 'test2'}));
				expect(params.LogType).to.equal('None');
				expect(params.InvocationType).to.equal('RequestResponse');
				callback(null, { Payload: JSON.stringify({
					body: "Hello from JavaScript-Object from AWS-Lambda!",
					statusCode: 200
				})});
			});

			const result = await flowNode.invokeLambda({ func: 'greeting', payload: {key1: 'JavaScript-Object', key2: 'test2'} });

			expect(result.callCount).to.equal(1);
			expect(result.context).to.deep.equal({
				result: {
					body: "Hello from JavaScript-Object from AWS-Lambda!",
					statusCode: 200
				}
			});
		});

		it('should succeed with valid JSON-String argument.', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			simple.mock(runtime.plugin.flownodes.lambda.lambdaClient, 'invoke').callFn(function (params, callback) {
				expect(params).to.be.an('Object');
				expect(params.FunctionName).to.equals('greeting');
				expect(params.Payload).to.be.an('string');
				expect(params.Payload).to.equal('{"key1": "JSON-String", "key2": "test2"}');
				expect(params.LogType).to.equal('None');
				expect(params.InvocationType).to.equal('RequestResponse');
				callback(null, { Payload: JSON.stringify({
					body: "Hello from JSON-String from AWS-Lambda!",
					statusCode: 200
				})});
			});

			const result = await flowNode.invokeLambda({ func: 'greeting', payload: '{"key1": "JSON-String", "key2": "test2"}' });

			expect(result.callCount).to.equal(1);
			expect(result.context).to.deep.equal({
				result: {
					body: "Hello from JSON-String from AWS-Lambda!",
					statusCode: 200
				}
			});
		});

		it('ASync call should also succedd', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			simple.mock(runtime.plugin.flownodes.lambda.lambdaClient, 'invoke').callFn(function (params, callback) {
				expect(params).to.be.an('Object');
				expect(params.FunctionName).to.equals('greeting');
				expect(params.Payload).to.be.an('string');
				expect(params.Payload).to.equal(JSON.stringify({key1: "JSON-String", key2: "test2"}));
				expect(params.LogType).to.equal('None');
				expect(params.InvocationType).to.equal('Event');
				callback(null, { StatusCode: 202});
			});

			const result = await flowNode.invokeLambda({ func: 'greeting', payload: {key1: "JSON-String", key2: "test2"}, asynchronous: true });

			expect(result.callCount).to.equal(1);
			expect(result.context).to.deep.equal({
				result: 'Accepted'
			});
		});
	});
});
