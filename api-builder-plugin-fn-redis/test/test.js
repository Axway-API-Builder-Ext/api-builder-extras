const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const simple = require('simple-mock');
const mock = require('mock-require');
const envLoader = require('dotenv');

// Loads environment variables from .env if the file exists
const envFilePath = path.join(__dirname, '.env');
if (fs.existsSync(envFilePath)) {
	envLoader.config({ path: envFilePath });
}
const { MockRuntime } = require('@axway/api-builder-test-utils');
const actions = require('../src/actions');
let getPlugin = require('../src');

const testSuiteType = process.env.TEST_TYPE ? process.env.TEST_TYPE.toLowerCase() : 'unit';

function isUnitTest() {
	return testSuiteType === 'unit';
}

/**
 * Construct the context needed for unit and integration test
 * execution - mocked runtime, mocked flow node, and mocked redis interface.
 * 
 * Note that 'mockedRedisClient' is only used in unit test suite.
 */
async function constructTestContext() {
	const options = {
		logger: {
			info: simple.mock(),
			trace: simple.mock(),
			error: simple.mock()
		}
	};
	const mockedRedisClient = {
		get: simple.mock().callFn(() => 'OK'),
		set: simple.mock().callFn(() => 'OK')
	}
	if (isUnitTest()) {
		mock(
			'../src/redis-client', 
			simple.mock().returnWith(mockedRedisClient)
		);
		getPlugin = mock.reRequire('../src');
	}
	const pluginConfig = {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT),
		// hooks can't be registed in test mode so set to false
		registerHooks: false
	}
	const getPluginSpy = simple.spy(getPlugin);
	const runtime = await MockRuntime.loadPlugin(getPluginSpy, pluginConfig, options);
	const flowNode = runtime.getFlowNode('redis');
	
	// mockedRedisClient is used only in unit test suite.
	// getPluginSpy is used only for integration test suite
	// to use the pluginContext to close the redis connection
	return { runtime, flowNode, mockedRedisClient, getPluginSpy }
}

describe('Redis flow-node', () => {
	beforeEach(async function () {
		const { ctx } = this.test;
		const { 
			runtime, 
			flowNode,
			mockedRedisClient,
			getPluginSpy 
		} = await constructTestContext();

		// Sets what we need into mocha ctx so we can use it in tests
		// In order for this to work use arrow functions on 'describe' statements
		// and normal functions on 'it' statements.
		ctx.runtime = runtime;
		ctx.flowNode = flowNode;
		ctx.mockedRedisClient = mockedRedisClient;
		ctx.getPluginSpy = getPluginSpy;
	});

	afterEach(async function () {
		const { getPluginSpy } = this;
		if (!isUnitTest()) {
			// Currently we don't offer conveniet way to test pluginContext
			// so we spy getPlugin to get the response where the pluginContext
			// is attached.
			const getPluginResponsePromise = getPluginSpy.calls[0].returned
			getPluginResponsePromise.then(async (value) => {
				// This is how we gracefully shutdown when we do
				// integration testing
				await value.redisClient.quit();
			});
		}
		simple.restore();
		mock.stopAll();
	});

	describe('# Constructor', () => {
		it('should define flow-nodes', function () {
			const { runtime, flowNode } = this;
			expect(runtime).to.exist;
			expect(flowNode).to.be.a('object');
			expect(actions).to.be.an('object');
			expect(actions.get).to.be.a('function');
			expect(actions.set).to.be.a('function');
		});

		it('should define valid flow-nodes', function () {
			const { runtime } = this;
			runtime.validate();
		});
	});

	describe('# Get data from Redis', () => {
		it('should error when missing parameter key', async function () {
			const { flowNode } = this;

			const { value, callCount, output } = await flowNode.get({ key: null });

			expect(callCount).to.equal(1);
			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should succeed with valid argument', async function () {
			const { flowNode, mockedRedisClient } = this;
			if (!isUnitTest()) { // Explicit that calling 'set' is needed only for Integration test suite
				await flowNode.set({ key: '123456', value: 'OK' });
			}
			const { value, callCount, output } = await flowNode.get({ key: '123456' });

			if (isUnitTest()) {
				expect(mockedRedisClient.get.callCount).to.equal(1)
				expect(mockedRedisClient.get.firstCall.arg).to.equal('123456');
			}
			expect(callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.deep.equal('OK');
		});

		it('should end with noResult for an an unkown key', async function () {
			const { flowNode, mockedRedisClient } = this;
			if (isUnitTest()) {
				// This is how we overide default behavior of mocked interface
				mockedRedisClient.get = simple.mock();
			}

			const { value, callCount, output } = await flowNode.get({ key: 'UNKNOWN' });

			expect(callCount).to.equal(1);
			expect(output).to.equal('noResult');
			expect(value).to.deep.equal('');
		});
	});

	describe('# Set data to Redis', () => {
		it('should error when missing parameter key', async function () {
			const { flowNode } = this;

			const { value, callCount, output } = await flowNode.set({ key: null });

			expect(callCount).to.equal(1);
			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should error when missing parameter key', async function () {
			const { flowNode } = this;

			const { value, callCount, output } = await flowNode.set({
				value: null, key: "key123"
			});

			expect(callCount).to.equal(1);
			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: value');
		});

		it('should succeed with valid arguments key and value', async function () {
			const { flowNode, mockedRedisClient } = this;

			const { value, callCount, output } = await flowNode.set({ key: 'key123', value: 'value123' });

			if (isUnitTest()) {
				expect(mockedRedisClient.set.callCount).to.equal(1)
				expect(mockedRedisClient.set.firstCall.args).to.deep.equal(['key123', 'value123']);
			}
			expect(callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.deep.equal('OK');
		});

		it('should succeed with valid arguments key and value and a ttl', async function () {
			const { flowNode, mockedRedisClient } = this;

			const { value, callCount, output } = await flowNode.set({ key: 'key123', value: 'value123', expiremilliseconds: 5000 });

			if (isUnitTest()) {
				expect(mockedRedisClient.set.callCount).to.equal(1)
				expect(mockedRedisClient.set.firstCall.args).to.deep.equal(['key123', 'value123', 'PX', 5000]);
			}
			expect(callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.deep.equal('OK');
		});

		it('should succeed using a value with type: Object', async function () {
			const { flowNode, mockedRedisClient } = this;

			const { value, callCount, output } = await flowNode.set({
				key: 'objectKey',
				value: {
					prop1: 'value1', prop2: 'value2'
				}
			});
			if (isUnitTest()) {
				expect(mockedRedisClient.set.callCount).to.equal(1)
				expect(mockedRedisClient.set.firstCall.args).to.deep.equal([
					'objectKey',
					JSON.stringify({
						prop1: 'value1', prop2: 'value2'
					})
				]);
			}
			expect(callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.deep.equal('OK');
		});

		it('should succeed using a value with type: Array', async function () {
			const { flowNode, mockedRedisClient } = this;

			const testArray = ["value1", "value2"];
			const { value, callCount, output } = await flowNode.set({
				key: 'arrayKey',
				value: testArray
			});

			if (isUnitTest()) {
				expect(mockedRedisClient.set.callCount).to.equal(1)
				expect(mockedRedisClient.set.firstCall.args).to.deep.equal([
					'arrayKey',
					JSON.stringify(testArray)
				]);
			}
			expect(callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.deep.equal('OK');
		});

		it('should succeed using a value with type: Date', async function () {
			const { flowNode, mockedRedisClient } = this;

			const testDate = new Date('1995-12-17T03:24:00');
			const { value, callCount, output } = await flowNode.set({
				key: 'objectKey',
				value: testDate
			});

			if (isUnitTest()) {
				expect(mockedRedisClient.set.callCount).to.equal(1)
				expect(mockedRedisClient.set.firstCall.args).to.deep.equal([
					'objectKey',
					testDate
				]);
			}
			expect(callCount).to.equal(1);
			expect(output).to.equal('next');
			expect(value).to.deep.equal('OK');
		});

		it('should fail using a key with type: Object', async function () {
			const { flowNode } = this;

			const { value, callCount, output } = await flowNode.set({
				key: { key: "123" },
				value: 'SomeValue'
			});

			expect(callCount).to.equal(1);
			expect(output).to.equal('error');
			expect(value).to.be.instanceOf(Object)
				.and.to.have.property('message', '\'key\' must be a string.');
		});
	});
});

if (!isUnitTest()) {
	describe('Flow-node Config', () => {
			// Need to re-require because getPlugin might still point to 
			// mocked redis client.
			getPlugin = mock.reRequire('../src');
			it('should throw when not configured properly', async () => {
				const options = {
					logger: {
						trace: simple.mock(),
						error: simple.mock()
					}
				};		
				const pluginConfig = {
					host: 'abc',
					port: '123',
					// hooks can't be registed in test mode so set to false
					registerHooks: false
				}
				try {
					await getPlugin(pluginConfig, options);
					expect.fail('Unexpected');
				} catch (ex) {
					expect(options.logger.error.calls).to.have.length(1);
					expect(
						options.logger.error.calls[0].arg
					).to.equal(`Failed to connect to Redis server: abc:123. Make sure Redis server is running and conf/redis.default.js is configured`);
					expect(ex.origin.message).to.equal('Redis connection to abc:123 failed - getaddrinfo ENOTFOUND abc')
				}
			});	
	});
}
