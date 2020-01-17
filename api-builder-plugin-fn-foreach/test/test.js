const simple = require('simple-mock');
const mockRequire = require('mock-require');
const server = {};
mockRequire('@axway/api-builder-runtime', server);

const nodeModule = require('../src')();
const action = require('../src/action');
const expect = require('chai').expect;
const { mocknode, validate } = require('axway-flow-sdk');

describe('api-builder-plugin-fn-foreach', () => {
	let flownodes;
	before(() => {
		return nodeModule.then(resolvedSpecs => {
			flownodes = resolvedSpecs;
		});
	});

	describe('#constructor', () => {
		it('[TEST-1] should define flownodes', () => {
			expect(flownodes).to.exist;
			expect(typeof action).to.equal('function');
			expect(mocknode('foreach')).to.exist;
		});

		// It's vital to ensure that the generated node flownodes are valid for use
		// in API Builder. Your unit tests should always include this validation
		// to avoid potential issues when API Builder loads your node.
		it('[TEST-2] should define valid flownodes', () => {
			expect(validate(flownodes)).to.not.throw;
		});
	});

	describe('#foreach', () => {
		beforeEach(() => {
			server.getGlobal = () => server;
			server.logger = simple.stub();
			server.getFlow = simple.stub();
			server.flowManager = {
				flow: simple.stub(),
			};
		});

		it('[FOREACH-1] should execute the specified flow with the supplied items', () => {
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

			return mocknode(flownodes).node('foreach').invoke('flowforeach', {
				flow: 'someFlow',
				items: inputs
			}).then((data) => {
				expect(data).to.deep.equal({
					next: [ null, [ 'one', 'two', 'three' ] ]
				});

				expect(server.getFlow.callCount).to.equal(1);
				expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
				expect(server.flowManager.flow.callCount).to.equal(3);
				expect(server.flowManager.flow.calls[0].args).to.deep.equal([ 'someFlow', inputs[0], { logger: server.logger } ]);
				expect(server.flowManager.flow.calls[1].args).to.deep.equal([ 'someFlow', inputs[1], { logger: server.logger } ]);
				expect(server.flowManager.flow.calls[2].args).to.deep.equal([ 'someFlow', inputs[2], { logger: server.logger } ]);
			});
		});

		it('[FOREACH-2] should handle empty items', () => {
			const inputs = [];
			server.getFlow.returnWith(true);

			return mocknode(flownodes).node('foreach').invoke('flowforeach', {
				flow: 'someFlow',
				items: inputs
			}).then((data) => {
				expect(data).to.deep.equal({
					next: [ null, [] ]
				});

				expect(server.getFlow.callCount).to.equal(1);
				expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
				expect(server.flowManager.flow.callCount).to.equal(0);
			});
		});

		it('[FOREACH-3] should handle undefined items', () => {
			server.getFlow.returnWith(true);

			return mocknode(flownodes).node('foreach').invoke('flowforeach', {
				flow: 'someFlow'
			}).then((data) => {
				expect(data).to.deep.equal({
					next: [ null, [] ]
				});

				expect(server.getFlow.callCount).to.equal(1);
				expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
				expect(server.flowManager.flow.callCount).to.equal(0);
			});
		});

		it('[FOREACH-4] should fire flowNotFound', () => {
			server.getFlow.returnWith(false);

			return mocknode(flownodes).node('foreach').invoke('flowforeach', {
				flow: 'someFlow',
				items: []
			}).then((data) => {
				expect(data).to.deep.equal({
					flowNotFound: [ null, 'someFlow' ]
				});

				expect(server.getFlow.callCount).to.equal(1);
				expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
				expect(server.flowManager.flow.callCount).to.equal(0);
			});
		});

		it('[FOREACH-5] should trigger error one exception', () => {
			const inputs = [
				{ name: 'tom' },
				{ name: 'dick' },
				{ name: 'harry' }
			];
			const error = new Error('expected');
			server.getFlow.returnWith(true);
			server.flowManager.flow.rejectWith(error);

			return mocknode(flownodes).node('foreach').invoke('flowforeach', {
				flow: 'someFlow',
				items: inputs
			}).then((data) => {
				expect(data).to.deep.equal({
					error: [ null, error ]
				});

				expect(server.getFlow.callCount).to.equal(1);
				expect(server.getFlow.calls[0].args).to.deep.equal([ 'someFlow' ]);
				expect(server.flowManager.flow.callCount).to.equal(1);
			});
		});
	});
});
