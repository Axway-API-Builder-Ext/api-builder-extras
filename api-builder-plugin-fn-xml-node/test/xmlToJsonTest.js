const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('api-builder-plugin-fn-xml-node', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('xml-node');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'xml-node'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('XML');
			expect(flowNode.description).to.equal('Provides support to handle XML-Payload');
			expect(flowNode.icon).to.be.a('string');
			expect(flowNode.getMethods()).to.deep.equal([
				'xml2json'
			]);
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#xml2json', () => {
		it('should error when missing required parameter', async () => {
			// Invoke #hello with a non-number and check error.
			const { value, output } = await flowNode.xml2json({
				xmlData: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: xmlData');
			expect(output).to.equal('error');
		});

		it('should convert XML into a JS Object', async () => {
			var xmlMessage = require('fs').readFileSync('./test/testMessages/basic_message.xml', 'utf8');
			var jsonMessage = JSON.parse(require('fs').readFileSync('./test/testMessages/basic_message.json', 'utf8'));
			const { value, output } = await flowNode.xml2json({ xmlData: xmlMessage });

			expect(output).to.equal('next');
			expect(value).to.deep.equal(jsonMessage);
		});

		it('should convert XML into a JSON-String', async () => {
			var xmlMessage = require('fs').readFileSync('./test/testMessages/basic_message.xml', 'utf8');
			var jsonMessage = JSON.parse(require('fs').readFileSync('./test/testMessages/basic_message.json', 'utf8'));
			const { value, output } = await flowNode.xml2json({ xmlData: xmlMessage, asString: true });

			expect(output).to.equal('next');
			expect(value).to.be.a('string');
			expect(value).to.deep.equal(JSON.stringify(jsonMessage));
		});

		it('should fail with an invalid XML structure', async () => {
			var xmlMessage = require('fs').readFileSync('./test/testMessages/invalid_message.xml', 'utf8');
			const { value, output } = await flowNode.xml2json({ xmlData: xmlMessage, asString: true });

			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message');
			expect(value.message).to.include('Failed to convert XML to JSON. Error: Invalid characters in closing tag');
		});

		it.only('should succeed with a Quote SOAP-XML response', async () => {
			var xmlMessage = require('fs').readFileSync('./test/testMessages/quote_soap_response.xml', 'utf8');
			var jsonMessage = JSON.parse(require('fs').readFileSync('./test/testMessages/quote_soap_response.json', 'utf8'));
			const { value, output } = await flowNode.xml2json({ xmlData: xmlMessage, asString: true });

			expect(output).to.equal('next');
			expect(value).to.be.a('string');
			expect(value).to.deep.equal(JSON.stringify(jsonMessage));
		});
	});
});
