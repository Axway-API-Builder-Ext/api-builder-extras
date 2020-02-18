const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

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

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
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
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: func');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: func');
		});

		it('should succeed with valid JavaScript argument.', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			const result = await flowNode.invokeLambda({ func: 'greeting', payload: {key1: 'JavaScript-Object', key2: 'test2'} });

			expect(result.callCount).to.equal(1);
			expect(result.context).to.deep.equal({
				result: {
					body: "\"Hello from JavaScript-Object from AWS-Lambda!\"",
					statusCode: 200
				}
			});
		}).timeout(5000);

		it('should succeed with valid JSON-String argument.', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			const result = await flowNode.invokeLambda({ func: 'greeting', payload: '{"key1": "JSON-String", "key2": "test2"}' });

			expect(result.callCount).to.equal(1);
			expect(result.context).to.deep.equal({
				result: {
					body: "\"Hello from JSON-String from AWS-Lambda!\"",
					statusCode: 200
				}
			});
		}).timeout(5000);

		it('ASync call should also succedd', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			const result = await flowNode.invokeLambda({ func: 'greeting', payload: {key1: "JSON-String", key2: "test2"}, asynchronous: true });

			expect(result.callCount).to.equal(1);
			expect(result.context).to.deep.equal({
				result: 'Accepted'
			});
		}).timeout(5000);
	});
});
