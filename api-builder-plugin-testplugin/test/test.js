const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../src');
const actions = require('../src/actions');

describe('flow-node testplugin', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin()));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.hello).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('testplugin');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flownode.name).to.equal('Hello World');
			expect(flownode.description).to.equal('Example flow-node to say hello.');
			expect(flownode.icon).to.be.a('string');
			expect(flownode.methods).to.deep.equal({
				hello: {
					name: 'Say Hello',
					description: 'Generates a greeting.',
					parameters: {
						name: {
							description: 'The name of the person to greet.',
							required: true,
							initialType: 'string',
							schema: {
								type: 'string'
							}
						}
					},
					outputs: {
						next: {
							name: 'Next',
							context: '$.hello',
							schema: {
								type: 'string'
							}
						},
						error: {
							name: 'Error',
							context: '$.error',
							schema: {
								type: 'string'
							}
						}
					}
				}
			});
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#hello', () => {
		it('should error when missing parameter', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('testplugin');

			const result = await flowNode.hello({
				name: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: name');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: name');
		});

		it('should succeed with valid argument', async () => {
			const flowNode = runtime.getFlowNode('testplugin');

			const result = await flowNode.hello({ name: 'World' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([ null, 'Hello World' ]);
			expect(result.context).to.deep.equal({
				hello: 'Hello World'
			});
		});
	});
});
