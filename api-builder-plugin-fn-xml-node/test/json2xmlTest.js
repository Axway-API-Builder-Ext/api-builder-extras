const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('json2xmlTest', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('xml-node');
	});

	describe('#json2xml', () => {
		it('should error when missing required parameter', async () => {
			const { value, output } = await flowNode.json2xml({
				jsonData: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: jsonData');
			expect(output).to.equal('error');
		});

		it('should convert JSON-Object into XML', async () => {
			var xmlMessage = require('fs').readFileSync('./test/testMessages/basic_message-no-attributes.xml', 'utf8');
			var jsonMessage = JSON.parse(require('fs').readFileSync('./test/testMessages/basic_message.json', 'utf8'));
			const { value, output } = await flowNode.json2xml({ jsonData: jsonMessage, spaces: '\t' });

			expect(value).to.deep.equal(xmlMessage);
			expect(output).to.equal('next');
		});

		it('should convert JSON-String into XML', async () => {
			var xmlMessage = require('fs').readFileSync('./test/testMessages/basic_message-no-attributes.xml', 'utf8');
			var jsonMessage = JSON.parse(require('fs').readFileSync('./test/testMessages/basic_message.json', 'utf8'));
			const { value, output } = await flowNode.json2xml({ jsonData: JSON.stringify(jsonMessage), spaces: '\t' });

			expect(output).to.equal('next');
			expect(value).to.be.a('string');
			expect(value).to.deep.equal(xmlMessage);
		});

		it('should fail with an invalid JSON structure', async () => {
			var jsonMessage = require('fs').readFileSync('./test/testMessages/invalid_message.json', 'utf8');
			const { value, output } = await flowNode.json2xml({ jsonData: jsonMessage });

			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message');
			expect(value.message).to.include('Failed to convert JSON into XML. Error: The JSON structure is invalid');
		});
	});
});
