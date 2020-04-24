const createRedisClient = require('./redis-client');
const { createPluginWithContext } = require('./utils');

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	let redisClient;
	try {
		redisClient = await createRedisClient(pluginConfig, options);
	} catch (ex) {
		options.logger.error(
			`\nFailed to connect to Redis server: ${pluginConfig.host}:${pluginConfig.port} \nMake sure Redis server is running and conf/redis.default.js is configured`
		);
		return Promise.reject(ex);
	}
	// All you pass here will be set as context for your actions
	return createPluginWithContext({ redisClient });
}

module.exports = getPlugin;
