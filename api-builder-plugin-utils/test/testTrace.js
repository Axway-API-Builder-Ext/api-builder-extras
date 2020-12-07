const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('flow-node trace', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('utils');
	});

	describe('#trace', () => {
		it('should error when missing required parameter', async () => {
			const { value, output } = await flowNode.traceMessage({ message: null });

			expect(value).to.equal('Message to trace is missing');
			expect(output).to.equal('next');
		});

		it('should error when missing required parameter', async () => {
			const { value, output } = await flowNode.traceMessage({ message: "My Log message" });

			expect(value).to.equal('Message Trace-Level is missing');
			expect(output).to.equal('next');
		});

		it('should error when missing required parameter', async () => {
			const { value, output } = await flowNode.traceMessage({ message: "My Log message", level: "XXXX" });

			expect(value).to.equal('Log-Level: XXXX is unknown. My Log message');
			expect(output).to.equal('next');
		});

		it('should replace simple variable with the given data object', async () => {
			const { value, output } = await flowNode.traceMessage({ message: "My Log message for ${a}", data: { a: "Value a"}, level: "info" });

			expect(value).to.equal('My Log message for Value a');
			expect(output).to.equal('next');
		});

		it('should replace given placeholders with the given data', async () => {
			const { value, output } = await flowNode.traceMessage({ message: "My Log message for ${a.b}", data: { a: { b: "Value b" }}, level: "info" });

			expect(value).to.equal('My Log message for Value b');
			expect(output).to.equal('next');
		});

		it('should replace given placeholders with the given data', async () => {
			const { value, output } = await flowNode.traceMessage({ message: "My Log message for ${a[0]}", data: { a: ["Value TEST"]}, level: "info" });

			expect(value).to.equal('My Log message for Value TEST');
			expect(output).to.equal('next');
		});
	});
});
