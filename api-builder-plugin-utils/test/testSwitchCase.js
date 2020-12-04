const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('flow-node utils', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('utils');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'utils'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('Utils');
			expect(flowNode.icon).to.be.a('string');
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#switchCase', () => {
		it('should error when missing required parameter', async () => {
			const { value, output } = await flowNode.switchCase({ source: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: source');
			expect(output).to.equal('error');
		});

		it('should error when missing required parameter', async () => {
			const { value, output } = await flowNode.switchCase({ source: 'World' });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: value1');
			expect(output).to.equal('error');
		});

		it('should succeed with exit 1 valid string argument', async () => {
			const { value, output } = await flowNode.switchCase({ source: 'World', value1: 'World' });

			expect(value).to.equal('World');
			expect(output).to.equal('1');
		});

		it('should succeed with exit 3 valid string argument', async () => {
			const { value, output } = await flowNode.switchCase({ source: 'World-3', value1: 'World-1', value2: 'World-2', value3: 'World-3' });

			expect(value).to.equal('World-3');
			expect(output).to.equal('3');
		});

		it('should succeed the the given string contains leading spaces', async () => {
			const { value, output } = await flowNode.switchCase({ source: '    World    ', value1: ' World ' });

			expect(value).to.equal('World');
			expect(output).to.equal('1');
		});

		it('should fail with an error if there is not match', async () => {
			const { value, output } = await flowNode.switchCase({ source: 'World-XXXX', value1: 'World-1', value2: 'World-2', value3: 'World-3' });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'No match for source: World-XXXX on given values.');
			expect(output).to.equal('error');
		});

		it('should default if there is not match', async () => {
			const { value, output } = await flowNode.switchCase({ source: 'World-XXXX', value1: 'World-1', value2: 'World-2', value3: 'World-3', notMatchDefault: true });

			expect(value).to.equal('World-XXXX');
			expect(output).to.equal('default');
		});
	});
});
