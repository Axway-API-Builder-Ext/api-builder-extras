const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('flow-node pdf', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({
			validateInputs: true,
			validateOutputs: true
		});
		flowNode = plugin.getFlowNode('pdf');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([ 'pdf' ]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('PDF');
			expect(flowNode.description)
				.to.equal('PDF functions.');
			expect(flowNode.icon).to.be.a('string');
			expect(flowNode.getMethods()).to.deep.equal([
				'generatePDFFromMarkdown',
				'parsePDF'
			]);
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#generatePDFFromMarkdown', () => {
		it('should error when missing required parameter', async () => {
			// Disable automatic input validation (we want the action to handle this)
			plugin.setOptions({ validateInputs: false });

			// Invoke method with a null and check error.
			const { value, output } = await flowNode.generatePDFFromMarkdown({
				markdown: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: markdown');
			expect(output).to.equal('error');
		});

		it('should succeed with valid argument', async () => {
			const {
				value,
				output
			} = await flowNode.generatePDFFromMarkdown({
				markdown: '# Hello'
			});
			expect(value).to.match(/^%PDF-1.4/);
			expect(output).to.equal('next');
		});
	});

	describe('#parsePDF', () => {
		it('should error when missing required parameter', async () => {
			// Disable automatic input validation (we want the action to handle this)
			plugin.setOptions({ validateInputs: false });

			// Invoke method with a null and check error.
			const { value, output } = await flowNode.parsePDF({
				data: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: data');
			expect(output).to.equal('error');
		});

		it('should succeed with valid argument', async () => {
			const {
				value: data
			} = await flowNode.generatePDFFromMarkdown({
				markdown: '# Hello'
			});

			const {
				value,
				output
			} = await flowNode.parsePDF({
				data
			});
			expect(value).to.deep.include({
				pages: 1,
				pagesRendered: 1,
				version: '1.10.100',
				metadata: null,
				text: '\n\nHello',
				version: '1.10.100'
			});
			// this is a date
			expect(value.info).to.have.property('created');
			// this is a date
			expect(value.info).to.have.property('modified');
			expect(value.info).to.deep.include({
				version: '1.4',
				isAcroFormPresent: false,
				isXFAPresent: false,
				creator: 'Chromium',
				producer: 'Skia/PDF m100'
			})
			expect(output).to.equal('next');
		});
	});
});
