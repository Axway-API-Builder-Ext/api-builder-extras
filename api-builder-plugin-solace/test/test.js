const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
const getPlugin = require('../src');
const actionFactory = require('../src/actions');

describe('flow-node solace', () => {
	let plugin;
	before(async () => plugin = await MockRuntime.loadPlugin(getPlugin));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actionFactory).to.be.a('function');
			const actions = actionFactory();
			expect(actions).to.be.an('object');
			expect(actions.publish).to.be.a('function');
			expect(actions.subscribe).to.be.a('function');
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'solace'
			]);
			const flowNode = plugin.getFlowNode('solace');
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('Solace');
			expect(flowNode.description).to.equal('Connect to Solace.');
			expect(flowNode.icon).to.be.a('string');
			expect(flowNode.getMethods()).to.deep.equal([
				'publish', 'subscribe'
			]);
		});
		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});
});
