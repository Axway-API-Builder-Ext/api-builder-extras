const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../src');
const actions = require('../src/directions');

const validPluginConfig = require('./config/google-maps.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];
const invalidPluginConfig = require('./config/google-maps.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-google-maps'];

describe('Google-Maps Directions-API Tests', () => {
	let runtime;
	let invalidRuntime;
	before(async () => invalidRuntime = new MockRuntime(await getPlugin(invalidPluginConfig)));
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));
	
	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.directions).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('googleMaps');
			expect(flownode).to.be.a('object');
			expect(flownode.name).to.equal('Google Maps');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#directions', () => {
		it('should error when missing parameter: origin', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.directions({
				origin: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: origin');
		});

		it('should error when missing parameter: destination', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Missing required parameter: destination');
		});

		it('should error if not configured - API-Key is missing', async () => {
			const flowNode = invalidRuntime.getFlowNode('googleMaps');

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Frankfurt'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.error).to.have.property('message', 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
		});

		it('Origin or destination NOT_FOUND', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('XXXXXXXXXXXXXXXXX');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'NOT_FOUND'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'XXXXXXXXXXXXXXXXX'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('notFound');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.notFound).to.deep.include({ status: 'NOT_FOUND' });
		});

		it('Origin or destination ZERO_RESULTS', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Berlin Germany');
				expect(input.params.destination).to.equals('Los Angeles');
				expect(input.params.mode).to.equals('walking');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'ZERO_RESULTS'}});
			});

			const result = await flowNode.directions({
				origin: 'Berlin Germany',
				destination: 'Los Angeles',
				mode: 'walking'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('noRoute');
			expect(result.args[0]).to.equal(null);
			expect(result.context).to.be.an('Object');
			expect(result.context.noRoute).to.deep.include({ status: 'ZERO_RESULTS' });
		});

		it('Basic test no advanced options given', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Axway Frankfurt');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Frankfurt'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({
				status: 'OK'
			});
		});

		it('Using some advanced options: mode walking', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Axway Frankfurt');
				expect(input.params.mode).to.equals('walking');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK', travel_mode: 'WALKING'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Frankfurt',
				mode: 'walking'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("\"travel_mode\":\"WALKING\"");
		});

		it('Using some advanced options: language: de', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Axway Frankfurt');
				expect(input.params.language).to.equals('de');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK', info: 'Richtung'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Frankfurt',
				language: 'de'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("Richtung");
		});

		it('Using some advanced options: units: imperial', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Axway Frankfurt');
				expect(input.params.units).to.equals('imperial');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK', info: '0.4 mi'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Frankfurt',
				units: 'imperial'
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
			expect(JSON.stringify(result.context.result)).to.deep.include("0.4 mi");
		});

		it('Using some advanced options: avoid: ["tolls", "indoor", "highways"]', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Axway Phoenix');
				expect(input.params.avoid).to.be.an('array');
				expect(input.params.avoid).to.deep.equal(["tolls", "indoor", "highways"]);
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'ZERO_RESULTS'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Phoenix',
				// Based on that limitation, we don't get a root - That way this use-case is tested
				avoid: ["tolls", "indoor", "highways"]
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('noRoute');
			expect(result.context.noRoute).to.deep.include({ status: 'ZERO_RESULTS' });
		});

		it('Using some advanced options: waypoints: [Motel One Frankfurt Messe]', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Axway Frankfurt');
				expect(input.params.waypoints).to.be.an('array');
				expect(input.params.waypoints).to.deep.equal(["Motel One Frankfurt Messe"]);
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Axway Frankfurt',
				waypoints: ["Motel One Frankfurt Messe"]
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});

		it('Using some advanced options: alternatives: true - Expect 3 routes', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Frankfurt (Main) Hauptbahnhof, Am Hauptbahnhof, Frankfurt am Main');
				expect(input.params.alternatives).to.be.an('boolean');
				expect(input.params.alternatives).to.equal(true);
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Frankfurt (Main) Hauptbahnhof, Am Hauptbahnhof, Frankfurt am Main',
				alternatives: true
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context.result).to.deep.include({ status: 'OK' });
		});

		it('Using some advanced options: departure_time and arrival time set - Must lead to an error.', async () => {
			const flowNode = runtime.getFlowNode('googleMaps');

			simple.mock(runtime.plugin.flownodes.googleMaps.mapsClient, 'directions').callFn(function (input) {
				expect(input.params).to.be.an('Object');
				expect(input.params.origin).to.equals('Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main');
				expect(input.params.destination).to.equals('Frankfurt (Main) Hauptbahnhof, Am Hauptbahnhof, Frankfurt am Main');
				expect(input.params.departure_time).to.be.an('string');
				expect(input.params.departure_time).to.equal('2021-09-01 12:35:45');
				expect(input.params.arrival_time).to.be.an('string');
				expect(input.params.arrival_time).to.equal('2021-09-01 12:35:4');
				expect(input.params.key).to.equals(validPluginConfig.google.credentials.apiKey);
				return Promise.resolve( { data: { status: 'OK'}});
			});

			const result = await flowNode.directions({
				origin: 'Premier Inn Frankfurt Messe, Europa-Allee, Frankfurt am Main',
				destination: 'Frankfurt (Main) Hauptbahnhof, Am Hauptbahnhof, Frankfurt am Main',
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
