const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');
const APIBuilder = require('@axway/api-builder-runtime');

const simple = require('simple-mock');
const mockRequire = require('mock-require');
const server = {};
mockRequire('@axway/api-builder-runtime', APIBuilder);

describe('api-builder-plugin-fn-foreach', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('foreach');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'foreach'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('For Each');
			expect(flowNode.description).to.equal('Loop over items and execute specified flow.');
			expect(flowNode.icon).to.be.a('string');
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#foreach', () => {
		beforeEach(() => {
			APIBuilder.getGlobal = () => server;
			server.logger = simple.stub();
			server.getFlow = simple.stub();
			server.flowManager = {
				flow: simple.stub(),
			};
		});

		it('[FOREACH-1] should execute the specified flow with the supplied items', async () => {
			const inputs = [
				{ name: 'tom' },
				{ name: 'dick' },
				{ name: 'harry' }
			];
			const returns = [
				'one', 'two', 'three'
			];
			server.getFlow.returnWith(true);
			server.flowManager.flow
				.resolveWith(returns[0])
				.resolveWith(returns[1])
				.resolveWith(returns[2]);

			const { value, output } = await flowNode.flowforeach({ flow: 'someFlow', items: inputs });

			expect(output).to.equal('next');
			expect(value).to.deep.equal([ 'one', 'two', 'three' ]);

			expect(server.getFlow.callCount).to.equal(1);
			expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
			expect(server.flowManager.flow.callCount).to.equal(3);
			expect(server.flowManager.flow.calls[0].args[0]).to.equal( 'someFlow' );
			expect(server.flowManager.flow.calls[0].args[1]).to.equal( inputs[0] );
			expect(server.flowManager.flow.calls[1].args[0]).to.equal( 'someFlow' );
			expect(server.flowManager.flow.calls[1].args[1]).to.equal( inputs[1] );
			expect(server.flowManager.flow.calls[2].args[0]).to.equal( 'someFlow' );
			expect(server.flowManager.flow.calls[2].args[1]).to.equal( inputs[2] );
		});

		it('[FOREACH-2] should handle empty items', async () => {
			const inputs = [];
			server.getFlow.returnWith(true);

			const { value, output } = await flowNode.flowforeach({ flow: 'someFlow', items: inputs });

			expect(output).to.equal('next');
			expect(value).to.deep.equal([]);

			expect(server.getFlow.callCount).to.equal(1);
			expect(server.getFlow.calls[0].args[0]).to.equal('someFlow');
			expect(server.flowManager.flow.callCount).to.equal(0);
		});

		it('[FOREACH-3] should handle undefined items', async () => {
			server.getFlow.returnWith(true);

			const { value, output } = await flowNode.flowforeach({ flow: 'someFlow' });

			expect(output).to.equal('next');
			expect(value).to.deep.equal([]);

			expect(server.getFlow.callCount).to.equal(1);
			expect(server.getFlow.calls[0].args[0]).to.equal('someFlow');
			expect(server.flowManager.flow.callCount).to.equal(0);
		});

		it('[FOREACH-4] should fire flowNotFound', async () => {
			server.getFlow.returnWith(false);

			const { value, output } = await flowNode.flowforeach({ flow: 'someFlow', items: [] });

			expect(output).to.equal('flowNotFound');
			expect(value).to.equal('The flow with name: \'someFlow\' could not be found.');
			expect(server.getFlow.callCount).to.equal(1);
			expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
			expect(server.flowManager.flow.callCount).to.equal(0);
		});

		it('[FOREACH-5] should trigger error on exception', async () => {
			const inputs = [
				{ name: 'tom' },
				{ name: 'dick' },
				{ name: 'harry' }
			];
			const error = new Error('expected');
			server.getFlow.returnWith(true);
			server.flowManager.flow.rejectWith(error);

			const { value, output } = await flowNode.flowforeach({ flow: 'someFlow', items: inputs });

			expect(output).to.equal('error');

			expect(server.getFlow.callCount).to.equal(1);
			expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
			expect(server.flowManager.flow.callCount).to.equal(1);
		});
	});
});
