const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../src');
const actions = require('../src/reverseGeocode');

const validPluginConfig = require('./config/google-maps.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];
const invalidPluginConfig = require('./config/google-maps.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];

describe('Google-Maps Reverse-Geocode-API Tests', () => {
	let runtime;
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidPluginConfig)));
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.reverseGeocode).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('googleMaps');
			expect(flownode).to.be.a('object');
			expect(flownode.name).to.equal('Google Maps');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#reverseGeocode', () => {
		it('should error when neither latLng or place_id is given', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.reverseGeocode({
				place_id: null,
				latlng: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'You must at least provide latlng or place_id');
		});

		it('should error if not configured - API-Key is missing', async () => {
			const flowNode = invalidRuntime.getFlowNode('googleMaps');

			const result = await flowNode.reverseGeocode({
				place_id: 'ChIJQxkLC8ZQqEcRdfnVRF5vXVs'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
		});

		it('Invalid request with no params given at all', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.reverseGeocode({});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'You must at least provide latlng or place_id');
		});

		it('Valid request with a given place_id', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.reverseGeocode({
				place_id: 'ChIJQxkLC8ZQqEcRdfnVRF5vXVs'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});

		it('Request with an invalid place_id', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.reverseGeocode({
				place_id: 'ChIJQxkLC8ZQqEcRdabVRF5vXVs'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('notFound');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.notFound).to.deep.include({ status: 'ZERO_RESULTS' });
		});
	});
});
