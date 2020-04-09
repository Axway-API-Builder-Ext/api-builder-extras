const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../../src');
const actions = require('../../src/places/textSearch');

const validPluginConfig = require('../config/google-maps.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];
const invalidPluginConfig = require('../config/google-maps.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];

describe('Google-Maps Text-Search-API Tests', () => {
	let runtime;
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidPluginConfig)));
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.textSearch).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('googleMapsPlaces');
			expect(flownode).to.be.a('object');
			expect(flownode.name).to.equal('Google Maps Places');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#textSearch', () => {
		it('should error when missing parameter: query', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.textSearch({
				query: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: query');
		});

		it('should error if not configured - API-Key is missing', async () => {
			const flowNode = invalidRuntime.getFlowNode('googleMapsPlaces');

			const result = await flowNode.textSearch({
				query: 'restaurant'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
		});

		it('Valid request with a valid query', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			simple.mock(runtime.plugin.flownodes.googleMapsPlaces.mapsClient, 'textSearch').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.query).to.equal('restaurant Berlin Kurfuerstendamm');
				expect(input.params.key).to.equal(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK'}, result: { status: 'OK'}});
			});

			const result = await flowNode.textSearch({
				query: 'restaurant Berlin Kurfuerstendamm'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});

		it('Valid request with a valid query and radius', async () => {
			const flowNode = runtime.getFlowNode('googleMapsPlaces');

			simple.mock(runtime.plugin.flownodes.googleMapsPlaces.mapsClient, 'textSearch').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.query).to.equal('Berlin Kurfuerstendamm 119');
				expect(input.params.radius).to.equal(30);
				expect(input.params.type).to.equal('restaurant');
				expect(input.params.key).to.equal(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK'}, result: { status: 'OK'}});
			});

			const result = await flowNode.textSearch({
				query: 'Berlin Kurfuerstendamm 119',
				radius: 30,
				type: 'restaurant'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});
	});
});
