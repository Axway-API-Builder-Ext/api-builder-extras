const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
const simple = require('simple-mock');
const mock = require('mock-require');
const actions = require('../src/actions');
let getPlugin = require('../src');
const pluginConfig = require('./test-config/basic-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-redis'];

describe('flow-node redis', () => {
	const options = {
		logger: {
			trace: simple.mock(),
			error: simple.mock()
		}, 
		// Avoid runtime hooks to be set
		isTest: true 
	};
	let mockRedisClient, rcGetMock, rcSetMock;

	let testVariable = {};

	beforeEach(async () => {
		if (pluginConfig.host === 'MOCK') {
			rcGetMock = simple.mock().callFn((key) => {
				return testVariable[key];
				// Add variations here if needed to handle other inputs
			});
			rcSetMock = simple.mock().callFn((key, value) => {
				testVariable[key] = value;
				return `OK`;
			});
			mockRedisClient = simple.mock().returnWith({
				get: rcGetMock,
				set: rcSetMock
			});
			mock('../src/redis-client', mockRedisClient);
			getPlugin = mock.reRequire('../src');
			runtime = new MockRuntime(await getPlugin(pluginConfig, options));
		} else {
			runtime = new MockRuntime(await getPlugin(pluginConfig, options));
			rcGetMock = simple.mock(runtime.plugin.flownodes.redis.redisClient, 'get');
			rcSetMock = simple.mock(runtime.plugin.flownodes.redis.redisClient, 'set');
		}
	});

	afterEach(async () => {
		simple.restore();
		mock.stopAll();
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

	describe('# Get data from Redis', () => {
		it('should error when missing parameter key', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.get({ key: null });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should succeed with valid argument', async () => {
			const flowNode = runtime.getFlowNode('redis');
			// Insert data to test
			await flowNode.set({
				key: '123456',
				value: 'ABCX'
			});

			const result = await flowNode.get({ key: '123456' });

			expect(rcGetMock.callCount).to.equal(1)
			expect(rcGetMock.firstCall.arg).to.equal('123456');
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args[1]).to.equal('ABCX');
		});

		it('should error with an unkown key', async () => {
			const flowNode = runtime.getFlowNode('redis');

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

			const result = await flowNode.set({ key: null });

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

			const result = await flowNode.set({ key: 'key123', value: 'value123' });

			expect(rcSetMock.callCount).to.equal(1)
			expect(rcSetMock.firstCall.args).to.deep.equal(['key123', 'value123']);
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should succeed using a value with type: Object', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.set({
				key: 'objectKey',
				value: {
					prop1: 'value1', prop2: 'value2'
				}
			});
			expect(rcSetMock.callCount).to.equal(1)
			expect(rcSetMock.firstCall.args).to.deep.equal([
				'objectKey',
				JSON.stringify({
					prop1: 'value1', prop2: 'value2'
				})
			]);
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should succeed using a value with type: Array', async () => {
			const flowNode = runtime.getFlowNode('redis');
			const testArray = ["value1", "value2"];

			const result = await flowNode.set({
				key: 'arrayKey',
				value: testArray
			});
			expect(rcSetMock.callCount).to.equal(1)
			expect(rcSetMock.firstCall.args).to.deep.equal([
				'arrayKey',
				JSON.stringify(testArray)
			]);
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should succeed using a value with type: Date', async () => {
			const testDate = new Date('1995-12-17T03:24:00');
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.set({
				key: 'objectKey',
				value: testDate
			});

			expect(rcSetMock.callCount).to.equal(1)
			expect(rcSetMock.firstCall.args).to.deep.equal([
				'objectKey',
				testDate
			]);
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should fail using a key with type: Object', async () => {
			const flowNode = runtime.getFlowNode('redis');

			const result = await flowNode.set({
				key: { key: "123" },
				value: 'SomeValue'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', '\'key\' must be a string.');
		});
	});

	after(async () => {
		if(runtime.plugin.flownodes.redis.redisClient.quit) {
			runtime.plugin.flownodes.redis.redisClient.quit(() => {
				options.logger.trace(`Redis client quit!`);
			})
		}
	});
});
