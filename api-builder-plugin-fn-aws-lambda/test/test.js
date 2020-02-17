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
			expect(actions.lambdaSync).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('lambda');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flownode.name).to.equal('AWS Lambda');
			expect(flownode.description).to.equal('Executes an AWS Lambda function');
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

	describe('#lambdaSync', () => {
		it('should error when missing parameter', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			const result = await flowNode.lambdaSync({
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

		it('should succeed with valid argument', async () => {
			const flowNode = runtime.getFlowNode('lambda');

			const result = await flowNode.lambdaSync({ func: 'greeting', payload: {key1: 'test 1', key2: 'test2'} });

			expect(result.callCount).to.equal(1);
			//expect(result.output).to.equal('next', result.output);
			expect(result.context).to.deep.equal({
				result: {
					body: "\"Hello from test 1 from AWS-Lambda!\"",
					statusCode: 200
				}
			});
		}).timeout(10000);;
	});
});
