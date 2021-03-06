const { promisify } = require("util");
const redis = require("redis");
const { registerRuntimeHooks } = require('./utils');

module.exports = async ({ pluginConfig, logger }) => {
	return new Promise((resolve, reject) => {
		const redisClient = redis.createClient({
			host: pluginConfig.host,
			port: pluginConfig.port,
			password: pluginConfig.password,
			// This method is needed to override retry strategy
			// if not specified the client tries to connect multiple times
			retry_strategy: (options) => {
				if (options.error && options.error.code === "ECONNREFUSED") {
					// When connection can't be stablished just stop trying.
					return new Error("The client can't establish connection to the Redis server");
				}
			}
		});

		// Register redisClient hooks
		redisClient.on("error", reject);
		redisClient.on('connect', () => {
			// 'ready' is emitted after 'connect' so just trace log here
			// and resolve the promise in 'ready' handler
			logger.info(`Connection to Redis server successful!`);
		});
		redisClient.on('ready', () => {
			logger.trace(`Redis client is ready!`);
			if (pluginConfig.registerHooks !== false) {
				registerRuntimeHooks({
					stopping: async () => {
						await redisClient.quit();
						logger.trace(`Redis client quit!`);
					}
				});
			}			
			return resolve(createInterface(redisClient));
		});
		redisClient.on('end', function () {
			// For some reason when we overide retry strategy 'end' is emitted
			// before `error` so just trace and don't deal with the promise here.
			logger.trace(`Redis server connection closed!`);
		});
	});
}

/**
 * The supported Redis interface. If you want to add more functions expose them here.
 * All available functions are described here: https://redis.io/commands
 *  
 * @param {object} redisClient the original Redis client interface
 * @return {object} interface that expose the async version of the currently
 * 	supported functions
 */
function createInterface(redisClient) {
	return {
		get: promisify(redisClient.get).bind(redisClient),
		set: promisify(redisClient.set).bind(redisClient),
		quit: promisify(redisClient.quit).bind(redisClient)
	}
}