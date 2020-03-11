const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../src');
const actions = require('../src/distance');

const validPluginConfig = require('./config/google-maps.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];
const invalidPluginConfig = require('./config/google-maps.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];

describe('Google-Maps Distance-API Tests', () => {
	let runtime;
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidPluginConfig)));
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.distance).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('googleMaps');
			expect(flownode).to.be.a('object');
			expect(flownode.name).to.equal('Google Maps');
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#distance', () => {
		it('should error when missing parameter: origins', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origin: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: origins');
		});

		it('should error when missing parameter: destinations', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: destinations');
		});

		it('should error if not configured - API-Key is missing', async () => {
			const flowNode = invalidRuntime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Axway Frankfurt']
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
		});

		it('Origin or destination NOT_FOUND', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['XXXXXXXXXXXXXXXXX']
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("\"status\":\"NOT_FOUND\"");
		});

		it('Origin or destination ZERO_RESULTS', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Berlin Germany'],
				destinations: ['Los Angeles'],
				mode: 'walking'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("\"status\":\"ZERO_RESULTS\"");
		});

		it('Basic test no advanced options given', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Axway Frankfurt']
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({
				status: 'OK'
			});
		});

		it('Using some advanced options: mode walking', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Axway Frankfurt'],
				mode: 'walking'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("12 mins");
		});

		it('Using some advanced options: language: de', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Axway Frankfurt'],
				language: 'de'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("Minuten");
		});

		it('Using some advanced options: units: imperial', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Axway Frankfurt'],
				units: 'imperial'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("mi");
		});

		it('Using some advanced options: avoid: ["tolls", "indoor", "highways"]', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Axway Phoenix'],
				// Based on that limitation, we don't get a root - That way this use-case is tested
				avoid: ["tolls", "indoor", "highways"]
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("\"status\":\"ZERO_RESULTS\"");
		});

		it('Using some advanced options: departure_time and arrival time set - Must lead to an error.', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.distance({
				origins: ['Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'],
				destinations: ['Frankfurt (Main) Hauptbahnhof, Am Hauptbahnhof, Frankfurt am Main'],
				departure_time: '2021-09-01 12:35:45',
				arrival_time: '2021-09-01 12:35:4'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'You cannot define departure_time and arrival_time at the same time.');
		});
	});
});
