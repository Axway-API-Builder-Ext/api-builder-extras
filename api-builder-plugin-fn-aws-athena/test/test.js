const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');
var simple = require('simple-mock');

describe('flow-node temp-plugin', () => {
	let plugin;
	let flowNode;

	const pluginConfig = require('./config/aws-athena.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-aws-athena'];

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({
			validateInputs: true,
			validateOutputs: true
		});
		flowNode = plugin.getFlowNode('athena');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'athena'
			]);
			expect(flowNode).to.be.a('object');

			expect(flowNode.name).to.equal('AWS Athena');
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('Valid PluginConfig tests', () => {
		it('should error when missing required parameter: table', async () => {
			// Disable automatic input validation (we want the action to handle this)
			plugin.setOptions({ validateInputs: false });

			const { value, output } = await flowNode.query({ table: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: table');
			expect(output).to.equal('error');
		});

		it('should error when missing required parameter: fields', async () => {
			// Disable automatic input validation (we want the action to handle this)
			plugin.setOptions({ validateInputs: false });

			const { value, output } = await flowNode.query({ table: 'elb_logs', fields: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: fields');
			expect(output).to.equal('error');
		});

		it('should error when missing required parameter: db', async () => {
			// Disable automatic input validation (we want the action to handle this)
			plugin.setOptions({ validateInputs: false });

			const { value, output } = await flowNode.query({ table: 'elb_logs', fields: 'elb_name, request_ip', db: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: db');
			expect(output).to.equal('error');
		});

		it('Make a simple query without a given limit - Must be limited to default 5', async () => {
			var mockedClient = simple.mock(plugin.getRawPlugin().flownodes.athena.athenaClient, 'query').callFn(function (params) {
				expect(params.sql).to.be.an('String');
				expect(params.sql).to.equals('SELECT elb_name, request_ip FROM elb_logs LIMIT 5');
				expect(params.db).to.be.an('String');
				expect(params.db).to.equals('sampledb');
				return Promise.resolve( { Items: [
					{elb_name: "elb_demo_003", request_ip: "251.165.102.100"}, 
					{elb_name: "elb_demo_007", request_ip: "250.120.176.53"}, 
				]});
			});

			const { value, output } = await flowNode.query({ table: 'elb_logs', db: 'sampledb', fields: 'elb_name, request_ip'});

			expect(mockedClient.callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.be.an('Object');
			expect(value).to.deep.equal({ Items: [
				{elb_name: "elb_demo_003", request_ip: "251.165.102.100"}, 
				{elb_name: "elb_demo_007", request_ip: "250.120.176.53"}, 
			]});
		});

		it('Make a simple query with limit 1', async () => {
			var mockedClient = simple.mock(plugin.getRawPlugin().flownodes.athena.athenaClient, 'query').callFn(function (params) {
				expect(params.sql).to.be.an('String');
				expect(params.sql).to.equals('SELECT elb_name, request_port FROM elb_logs LIMIT 1');
				expect(params.db).to.be.an('String');
				expect(params.db).to.equals('sampledb');
				return Promise.resolve( { Items: [
					{elb_name: "elb_demo_003", request_port: "24588"}
				]});
			});

			const { value, output } = await flowNode.query({ table: 'elb_logs', db: 'sampledb', fields: 'elb_name, request_port', limit: '1' });

			expect(mockedClient.callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.be.an('Object');
			expect(value).to.deep.equal({ Items: [
				{elb_name: "elb_demo_003", request_port: "24588"}
			]});
		}).timeout(15000);
	});
});