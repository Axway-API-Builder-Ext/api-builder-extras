const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
const getPlugin = require('../src');
const actions = require('../src/actions');

describe('flow-node producer', () => {
	let plugin;
	before(async () => plugin = await MockRuntime.loadPlugin(getPlugin));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.hello).to.be.a('function');
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'producer'
			]);
			const flowNode = plugin.getFlowNode('producer');
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('Kafka Producer');
			expect(flowNode.description).to.equal('A flow-node that puts JSON objects on Kafka topics.');
			expect(flowNode.icon).to.be.a('string');
			expect(flowNode.getMethods()).to.deep.equal([
				'publish'
			]);
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#hello', () => {
		it('should error when missing required parameter', async () => {
			const flowNode = plugin.getFlowNode('producer');

			// Invoke #hello with a non-number and check error.
			const result = await flowNode.hello({
				name: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(undefined);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: name');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: name');
		});

		it('should succeed with valid argument', async () => {
			const flowNode = plugin.getFlowNode('producer');

			const result = await flowNode.hello({ name: 'World' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([ undefined, 'Hello World' ]);
			expect(result.context).to.deep.equal({
				hello: 'Hello World'
			});
		});
	});
});
