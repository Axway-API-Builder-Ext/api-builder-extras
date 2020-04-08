const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../src');
const actions = require('../src/actions');

const pluginConfig = require('./test-config/basic-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-redis'];

describe('flow-node redis', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin(pluginConfig)));

	after(async () => {
		if(runtime.plugin.flownodes.redis.redisClient) {
			runtime.plugin.flownodes.redis.redisClient.quit()
		}
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.get).to.be.a('function');
			expect(actions.set).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('redis');
			expect(flownode).to.be.a('object');
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('#Get data from Redis', () => {
		it('should error when missing parameter key', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.get({
				key: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should succeed with valid argument', async () => {
			
			const flowNode = runtime.getFlowNode('redis');

			simple.mock(runtime.plugin.flownodes.redis.redisClient, 'get').callFn(function (key, callback) {
				expect(key).to.equal('ABC');
				callback(null, 'HELLO');
			});

			const result = await flowNode.get({ key: 'ABC' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[1]).to.equal('HELLO');
		});

		it('should error with an unkown key', async () => {
			
			const flowNode = runtime.getFlowNode('redis');

			simple.mock(runtime.plugin.flownodes.redis.redisClient, 'get').callFn(function (key, callback) {
				expect(key).to.equal('UNKNOWN');
				callback(null, null);
			});

			const result = await flowNode.get({ key: 'UNKNOWN' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'No result found for key: \'UNKNOWN\'');
		});
	});

	describe('#Set data to Redis', () => {
		it('should error when missing parameter key', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.set({
				key: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should error when missing parameter key', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.set({
				value: null, key: "key123"
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: value');
		});

		it('should succeed with valid arguments key and value', async () => {
			
			const flowNode = runtime.getFlowNode('redis');

			simple.mock(runtime.plugin.flownodes.redis.redisClient, 'set').callFn(function (key, value, callback) {
				expect(key).to.equal('key123');
				expect(value).to.equal('value123');
				callback(null, 'OK');
			});

			const result = await flowNode.set({ key: 'key123', value: 'value123' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[1]).to.equal('OK');
		});

		it('should succeed using a value with type: Object', async () => {
			const flowNode = runtime.getFlowNode('redis');

			simple.mock(runtime.plugin.flownodes.redis.redisClient, 'set').callFn(function (key, value, callback) {
				expect(key).to.equal('objectKey');
				expect(value).to.be.a('string');
				expect(value).to.deep.equal(JSON.stringify({prop1: 'value1', prop2: 'value2'}));
				callback(null, 'OK');
			});

			const result = await flowNode.set({ 
				key: 'objectKey', 
				value: {
					prop1: 'value1', prop2: 'value2' 
				}
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[1]).to.equal('OK');
		});

		it('should succeed using a value with type: Array', async () => {
			const flowNode = runtime.getFlowNode('redis');
			const testArray = ["value1", "value2"];

			simple.mock(runtime.plugin.flownodes.redis.redisClient, 'set').callFn(function (key, value, callback) {
				expect(key).to.equal('arrayKey');
				expect(value).to.be.a('string');
				expect(value).to.deep.equal(JSON.stringify(testArray));
				callback(null, 'OK');
			});

			const result = await flowNode.set({ 
				key: 'arrayKey', 
				value: testArray
			});
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[1]).to.equal('OK');
		});

		it('should succeed using a value with type: Date', async () => {
			const testDate = new Date('1995-12-17T03:24:00');
			const flowNode = runtime.getFlowNode('redis');

			simple.mock(runtime.plugin.flownodes.redis.redisClient, 'set').callFn(function (key, value, callback) {
				expect(key).to.equal('objectKey');
				expect(value).to.equal(testDate);
				expect(value).to.be.a('date');
				callback(null, 'OK');
			});

			const result = await flowNode.set({ 
				key: 'objectKey', 
				value: testDate
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[1]).to.equal('OK');
		});

		it('should fail using a key with type: Object', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.set({ 
				key: {key:"123"}, 
				value: 'SomeValue'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', '\'key\' must be a string.');
		});
	});
});
