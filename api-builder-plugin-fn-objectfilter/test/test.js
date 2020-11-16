const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

/*const nodeModule = require('../src')();
const action = require('../src/actions');
const expect = require('chai').expect;
const { mocknode, validate } = require('axway-flow-sdk');*/

describe('Flow-Node Objectfilter tests', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		flowNode = plugin.getFlowNode('objectfilter');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'objectfilter'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('Filter');
			expect(flowNode.description).to.equal('Filter the fields of an Object');
			expect(flowNode.icon).to.be.a('string');
			expect(flowNode.getMethods()).to.include('include');
			expect(flowNode.getMethods()).to.include('exclude');
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('include', () => {
		it('[TEST-3] should fail if no source', async () => {
			const { value, output } = await flowNode.include({
				source: null, fields: []
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Invalid source, object required.');
			expect(output).to.equal('error');
        });

		it('[TEST-4] should fail if no fields', async () => {
			const { value, output } = await flowNode.include({
				source: { hello: 'world' }, fields: undefined
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Invalid fields, array required.');
			expect(output).to.equal('error');
        });

		it('[TEST-5] only includes specified fields', async () => {
			const source = {
				field1: 'one',
				field2: 2,
				field3: { hello: 'world' },
				field4: true
			};
			const fields = [ 'field1', 'field3' ];

			const { value, output } = await flowNode.include({ source, fields });

			expect(output).to.equal('next');
			expect(value).to.deep.equal( { field1: 'one', field3: { hello: 'world' } }	);
        });
	});

	describe('exclude', () => {
		it('[TEST-6] should fail if no source', async () => {
			const { value, output } = await flowNode.exclude({ source: undefined, fields:[] });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Invalid source, object required.');
			expect(output).to.equal('error');
        });

		it('[TEST-7] should fail if no fields', async () => {
			const { value, output } = await flowNode.exclude({ source: { hello: 'world' }, fields: undefined });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Invalid fields, array required.');
			expect(output).to.equal('error');
        });

		it('[TEST-8] only includes specified fields', async () => {
			const source = {
				field1: 'one',
				field2: 2,
				field3: { hello: 'world' },
				field4: true
			};
			const fields = [ 'field1', 'field3' ];

			const { value, output } = await flowNode.exclude({ source, fields });

			expect(output).to.equal('next');
			expect(value).to.deep.equal( { field2: 2, field4: true }	);
        });
	});
});
