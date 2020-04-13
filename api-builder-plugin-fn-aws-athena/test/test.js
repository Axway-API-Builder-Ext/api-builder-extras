const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../src');
const actions = require('../src/actions');
const validPluginConfig = require('./config/aws-athena.testconfig').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-aws-athena'];
const invalidPluginConfig = require('./config/aws-athena.incomplete').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-aws-athena'];

describe('Basic configuration tests for AWS Athena connector', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.query).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('athena');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flownode.name).to.equal('AWS Athena');
			expect(flownode.description).to.equal('Flow node to query AWS Athena');
			expect(flownode.icon).to.be.a('string');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});
});

describe('Valid PluginConfig tests', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin(validPluginConfig)));

	describe('Query', () => {
		it('should error when without table parameter', async () => {
			const flowNode = runtime.getFlowNode('athena');
			const result = await flowNode.query({
				table: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: table');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: table');
		});

		it('should error when without fields parameter', async () => {
			const flowNode = runtime.getFlowNode('athena');
			const result = await flowNode.query({
				table: 'elb_logs'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: fields');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: fields');
		});

		it('should error when without db parameter', async () => {
			const flowNode = runtime.getFlowNode('athena');
			const result = await flowNode.query({
				table: 'elb_logs', fields: 'elb_name, request_ip'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: db');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: db');
		});

		it('Make a simple query without a given limit - Must be limited to default 5', async () => {
			const flowNode = runtime.getFlowNode('athena');

			simple.mock(runtime.plugin.flownodes.athena.athenaClient, 'query').callFn(function (params) {
				expect(params.sql).to.be.an('String');
				expect(params.sql).to.equals('SELECT elb_name, request_ip FROM elb_logs LIMIT 5');
				expect(params.db).to.be.an('String');
				expect(params.db).to.equals('sampledb');
				return Promise.resolve( { Items: [
					{elb_name: "elb_demo_003", request_ip: "251.165.102.100"}, 
					{elb_name: "elb_demo_007", request_ip: "250.120.176.53"}, 
				]});
			});

			const result = await flowNode.query({ table: 'elb_logs', db: 'sampledb', fields: 'elb_name, request_ip'});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.be.an('Array');
			expect(result.args[1]).to.have.keys(['Items']);
			expect(result.args[1].Items[0]).to.have.any.keys(['elb_name', 'request_ip']);
			expect(result.args[1].Items[0]).to.not.have.any.keys(['request_port']);
			expect(result.args[1].Items).to.have.lengthOf(2);
		});

		it('Make a simple query with limit 1', async () => {
			debugger;
			const flowNode = runtime.getFlowNode('athena');

			simple.mock(runtime.plugin.flownodes.athena.athenaClient, 'query').callFn(function (params) {
				expect(params.sql).to.be.an('String');
				expect(params.sql).to.equals('SELECT elb_name, request_port FROM elb_logs LIMIT 1');
				expect(params.db).to.be.an('String');
				expect(params.db).to.equals('sampledb');
				return Promise.resolve( { Items: [
					{elb_name: "elb_demo_003", request_port: "24588"}
				]});
			});

			const result = await flowNode.query({ table: 'elb_logs', db: 'sampledb', fields: 'elb_name, request_port', limit: '1' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.be.an('Array');
			expect(result.args[1]).to.have.keys(['Items']);
			expect(result.args[1].Items[0]).to.have.any.keys(['elb_name', 'request_port']);
			expect(result.args[1].Items[0]).to.not.have.any.keys(['request_ip']);
			expect(result.args[1].Items).to.have.lengthOf(1);
		}).timeout(15000);
	});
});
