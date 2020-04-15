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
const { MockRuntime } = require('@axway/api-builder-sdk');
const actions = require('../src/actions');
let getPlugin = require('../src');

const pluginConfig = require('./config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-redis'];
const testSuiteType = process.env.TEST_TYPE ? process.env.TEST_TYPE.toLowerCase() : 'unit';

function isUnitTest() {
	return testSuiteType === 'unit';
}

/**
 * Construct the context needed for unit and integration test
 * execution - mocked runtime, mocked flow node, and mocked redis interface.
 * 
 * Note that 'mockedRedisInterface' is only used in unit test suite.
 */
async function constructTestContext() {
	const options = {
		logger: {
			trace: simple.mock(),
			error: simple.mock()
		}
	};	
	const mockedRedisInterface = {
		get: simple.mock().callFn(() => 'OK'),
		set: simple.mock().callFn(() => 'OK')
	}
	if (isUnitTest()) {
		const mockedRedisClient = simple.mock().returnWith(mockedRedisInterface);
		mock('../src/redis-client', mockedRedisClient);
		getPlugin = mock.reRequire('../src');
	}
	const runtime = new MockRuntime(await getPlugin(pluginConfig, options));
	const flowNode = runtime.getFlowNode('redis');
	return { runtime, flowNode, mockedRedisInterface }
}

describe('flow-node redis', () => {
	beforeEach(async function () {
		const { ctx } = this.test;
		const { runtime, flowNode, mockedRedisInterface} = await constructTestContext();
		
		// Sets what we need into mocha ctx so we can use it in tests
		// In order for this to work use arrow functions on 'describe' statements
		// and normal functions on 'it' statements.
		ctx.runtime = runtime;
		ctx.flowNode = flowNode;
		ctx.mockedRedisInterface = mockedRedisInterface;
	});

	afterEach(async function () {
		const { flowNode } = this;
		if (!isUnitTest()) {
			// This is how we gracefully shutdown when we do
			// integration testing
			await flowNode.quit();
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
			expect(actions.quit).to.be.a('function');
		});

		it('should define valid flow-nodes', function () {
			const { runtime } = this;
			runtime.validate()
			// expect(runtime.validate()).to.not.throw;
		});
	});

	describe('# Get data from Redis', () => {
		it('should error when missing parameter key', async function () {
			const { flowNode } = this;

			const result = await flowNode.get({ key: null });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.be.null;
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should succeed with valid argument', async function () {
			const { flowNode, mockedRedisInterface} = this;
			if (!isUnitTest()) { // Explicit that calling 'set' is needed only for Integration test suite
				await flowNode.set({ key: '123456', value: 'OK' });
			}
			const result = await flowNode.get({ key: '123456' });

			if (isUnitTest()) {
				expect(mockedRedisInterface.get.callCount).to.equal(1)
				expect(mockedRedisInterface.get.firstCall.arg).to.equal('123456');
			}
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should error with an unkown key', async function () {
			const { flowNode, mockedRedisInterface } = this;
			if (isUnitTest()) {
				// This is how we overide default behavior of mocked interface
				mockedRedisInterface.get = simple.mock();
			}

			const result = await flowNode.get({ key: 'UNKNOWN' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.be.null;
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'No result found for key: \'UNKNOWN\'');
		});
	});

	describe('# Set data to Redis', () => {
		it('should error when missing parameter key', async function () {
			const { flowNode } = this;

			const result = await flowNode.set({ key: null });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.be.null;
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: key');
		});

		it('should error when missing parameter key', async function () {
			const { flowNode } = this;

			const result = await flowNode.set({
				value: null, key: "key123"
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.be.null;
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', 'Missing required parameter: value');
		});

		it('should succeed with valid arguments key and value', async function () {
			const { flowNode, mockedRedisInterface } = this;

			let result = await flowNode.set({ key: 'key123', value: 'value123' });

			if (isUnitTest()) {
				expect(mockedRedisInterface.set.callCount).to.equal(1)
				expect(mockedRedisInterface.set.firstCall.args).to.deep.equal(['key123', 'value123']);
			}
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should succeed using a value with type: Object', async function () {
			const { flowNode, mockedRedisInterface } = this;

			const result = await flowNode.set({
				key: 'objectKey',
				value: {
					prop1: 'value1', prop2: 'value2'
				}
			});
			if (isUnitTest()) {
				expect(mockedRedisInterface.set.callCount).to.equal(1)
				expect(mockedRedisInterface.set.firstCall.args).to.deep.equal([
					'objectKey',
					JSON.stringify({
						prop1: 'value1', prop2: 'value2'
					})
				]);
			}
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should succeed using a value with type: Array', async function () {
			const { flowNode, mockedRedisInterface } = this;

			const testArray = ["value1", "value2"];
			const result = await flowNode.set({
				key: 'arrayKey',
				value: testArray
			});

			if (isUnitTest()) {
				expect(mockedRedisInterface.set.callCount).to.equal(1)
				expect(mockedRedisInterface.set.firstCall.args).to.deep.equal([
					'arrayKey',
					JSON.stringify(testArray)
				]);
			}
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should succeed using a value with type: Date', async function () {			
			const { flowNode, mockedRedisInterface } = this;

			const testDate = new Date('1995-12-17T03:24:00');
			const result = await flowNode.set({
				key: 'objectKey',
				value: testDate
			});

			if (isUnitTest()) {
				expect(mockedRedisInterface.set.callCount).to.equal(1)
				expect(mockedRedisInterface.set.firstCall.args).to.deep.equal([
					'objectKey',
					testDate
				]);
			}
			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.args).to.deep.equal([null, 'OK']);
		});

		it('should fail using a key with type: Object', async function () {
			const { flowNode } = this;

			const result = await flowNode.set({
				key: { key: "123" },
				value: 'SomeValue'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.be.null;
			expect(result.args[1]).to.be.instanceOf(Object)
				.and.to.have.property('message', '\'key\' must be a string.');
		});
	});
});
