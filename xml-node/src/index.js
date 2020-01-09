const sdk = require('axway-flow-sdk');
const xmlToJson = require('./xmlToJson');

function getFlowNodes() {
	const flownodes = sdk.init(module);

	// The unique name of your flow-node.  You can define multiple flow-nodes in this
	// file, but one is typical.
	flownodes.add('xml-node', {
		name: 'XML',
		// file support for: svg, png, gif, bmp, jpg, and tiff
		icon: 'xml-node-icon.png',
		description: 'Provides support to handle XML-Payload'
	})
		// Add a method to your flow-node.
		.method('xml2json', {
			name: 'XML to JSON',
			description: 'Converts XML payload into JSON data'
		})
		// Add parameter(s) to your method.
		.parameter('xmlData', {
			title: 'XML Data',
			description: 'XML data to be converted',
			type: 'string'
		}, true)
		.parameter('asString', {
			title: 'As String',
			description: 'Encode the JSON response as a String',
			type: 'boolean'
		}, false)
		// Once all parameters for the method are defined, add output(s) to your method.
		.output('next', {
			name: 'Next',
			description: 'JSON data created',
			context: '$.jsonData',
			schema: {
				oneOf: [
					{ type: 'string' },
					{ type: 'object' }
				]
			}
		})
		// Provide the actual javascript implementation.
		.action(xmlToJson);

	return Promise.resolve(flownodes);
}

exports = module.exports = getFlowNodes;
