const { expect } = require('chai');
const simple = require('simple-mock');
const mock = require('mock-require');

describe('Redis Connection', () => {
  
  afterEach(() => {
    simple.restore();
		mock.stopAll();
  })

  it('should create the flow-node in dev mode when connection is broken', async function () {
    const pluginConfig = {
      host: 'myhost',
      port: 'myport'
    };
    const options = {
      logger: {
        trace: simple.mock(),
        error: simple.mock()
      }
    };
    const mockUtils = {
      isDeveloperMode: simple.mock().callFn(() => true),
      createPluginWithContext: simple.mock()
    }
		mock(
			'../src/redis-client',
      simple.mock().rejectWith('Connection error')
    );
		mock(
			'../src/utils', 
			mockUtils
		); 
    const getPlugin = mock.reRequire('../src');
    await getPlugin(pluginConfig, options);
    expect(options.logger.error.callCount).to.be.equal(1);
    expect(options.logger.error.firstCall.arg)
      .to.be.equal(`Failed to connect to Redis server: ${pluginConfig.host}:${pluginConfig.port}. Make sure Redis server is running and conf/redis.default.js is configured`);
    expect(mockUtils.isDeveloperMode.callCount).to.be.equal(1);
    expect(mockUtils.createPluginWithContext.callCount).to.be.equal(1);
  });

  it('should reject the flow-node creation in production when connection is broken', async function () {
    const pluginConfig = {
      host: 'myhost',
      port: 'myport'
    };
    const options = {
      logger: {
        trace: simple.mock(),
        error: simple.mock()
      }
    };
    const mockUtils = {
      isDeveloperMode: simple.mock().callFn(() => false),
      createPluginWithContext: simple.mock()
    }
		mock(
			'../src/redis-client',
      simple.mock().rejectWith('Connection error')
    );
		mock(
			'../src/utils', 
			mockUtils
		); 
    const getPlugin = mock.reRequire('../src');
    try {
      await getPlugin(pluginConfig, options);
      expect.fail('Unexpected');
    } catch(ex) {
      expect(options.logger.error.callCount).to.be.equal(1);
      expect(options.logger.error.firstCall.arg)
        .to.be.equal(`Failed to connect to Redis server: ${pluginConfig.host}:${pluginConfig.port}. Make sure Redis server is running and conf/redis.default.js is configured`);
      expect(mockUtils.isDeveloperMode.callCount).to.be.equal(1);
      expect(mockUtils.createPluginWithContext.callCount).to.be.equal(0);
      expect(ex).to.be.equal('Connection error');
    }
  });
});