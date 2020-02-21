const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../../src');
const actions = require('../../src/places/findPlaceFromText');

const validPluginConfig = require('../config/google-maps.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];
const invalidPluginConfig = require('../config/google-maps.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];

describe('Google-Maps FindPlaceFromText-API Tests', () => {
	let runtime;
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidPluginConfig)));
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.findPlaceFromText).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('googleMapsPlaces');
			expect(flownode).to.be.a('object');
			expect(flownode.name).to.equal('Google Maps Places');
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#findPlaceFromText', () => {
		it('should error when missing parameter: input', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.findPlaceFromText({
				input: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: input');
		});

		it('should error when missing parameter: inputtype', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.findPlaceFromText({
				input: 'Museum of Contemporary Art Australia',
				inputtype: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: inputtype');
		});

		it('should error if not configured - API-Key is missing', async () => {
			const flowNode = invalidRuntime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.findPlaceFromText({
				input: 'Museum of Contemporary Art Australia',
				inputtype: 'textQuery'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
		});

		it('Valid request with a valid input and inputtype', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.findPlaceFromText({
				input: 'Museum of Contemporary Art Australia',
				inputtype: 'textquery'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});

		it('Valid request with a valid input, inputtype and some fields', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.findPlaceFromText({
				input: 'Museum of Contemporary Art Australia',
				inputtype: 'textquery',
				fields: ['name', 'icon']
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(result.context.result.candidates[0]).to.have.property('icon');
			expect(result.context.result.candidates[0]).to.have.property('name');
		});
	});
});
