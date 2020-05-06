const { createPluginWithContext, isDeveloperMode } = require('./utils');
const createRedisClient = require('./redis-client');
const actions = require('./actions');

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	let redisClient;
	try {
		// In production we should be able to connect on startup
		// in development mode we defer this until action is invoked
		redisClient = await createRedisClient({
			pluginConfig,
			logger: options.logger
		});
	} catch (ex) {
		options.logger.error(
			`Failed to connect to Redis server: ${pluginConfig.host}:${pluginConfig.port}. Make sure Redis server is running and conf/redis.default.js is configured`
		);
		if (!isDeveloperMode()) {
			// In development mode we allow to defer the obtaining of successfull Redis connection.
			// The promise is rejected only in production.
			return Promise.reject(ex);
		}
	}
	// All you pass here will be set as context for your actions
	return createPluginWithContext(actions, { redisClient, pluginConfig });
}

module.exports = getPlugin;
