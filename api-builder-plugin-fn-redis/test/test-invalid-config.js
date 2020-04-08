const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');
var simple = require('simple-mock');

const getPlugin = require('../src');
const actions = require('../src/actions');

const pluginConfig = require('./test-config/invalid-config').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-redis'];

describe('Redis not ready tests', function () {
	let runtime;
	this.timeout(5000);
	before(async () => {
		runtime = new MockRuntime(await getPlugin(pluginConfig));
		// Wait a few seconds, as Redis needs a moment to report an error
		await Sleep(3000);
	})

	after(async () => runtime.plugin.flownodes.redis.redisClient.quit());

	describe('#Test behavior with invalid config', () => {
		it('Redis in error should be handled gracefully', () => {
			console.log("Redis should have reported an error");
			expect(runtime.plugin.flownodes.redis.redisClient.ready).to.equal(false);
		})
	});
});

function Sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
