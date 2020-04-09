const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../src');
const actions = require('../src/elevation');

const validPluginConfig = require('./config/google-maps.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];
const invalidPluginConfig = require('./config/google-maps.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];

describe('Google-Maps Elevation-API Tests', () => {
	let runtime;
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidPluginConfig)));
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.elevation).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('googleMaps');
			expect(flownode).to.be.a('object');
			expect(flownode.name).to.equal('Google Maps');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#elevation', () => {
		it('should error when missing parameter: locations', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.elevation({
				locations: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: locations');
		});

		it('should error if not configured - API-Key is missing', async () => {
			const flowNode = invalidRuntime.getFlowNode('googleMaps');

			const result = await flowNode.elevation({
				locations: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main']
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
		});

		it('Valid request with on location as an array', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'elevation').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.locations).to.be.an('array');
				expect(input.params.locations[0]).to.be.an('object');
				expect(input.params.locations[0].lat).to.equal(52.5588327);
				expect(input.params.locations[0].lng).to.equal(13.2884374);
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK', result: { status: "OK"}}});
			});

			const result = await flowNode.elevation({
				locations: [{lat: 52.5588327, lng: 13.2884374}]
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});
	});
});
