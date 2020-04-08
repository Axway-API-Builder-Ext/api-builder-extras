const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');
const redis = require("redis");
const { AbortError, AggregateError, ReplyError } = require("redis");

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
	const redisClient = getRedisClient(pluginConfig);
	const plugin = sdk.getPlugin();
	plugin.flownodes['redis'].methods.get.action = actions.get.bind({ redisClient });
	plugin.flownodes['redis'].methods.set.action = actions.set.bind({ redisClient });
	plugin.flownodes['redis'].redisClient = redisClient;
	return plugin;
}

function getRedisClient(pluginConfig, options) {
	try {
		const redisClient = redis.createClient({
			host: pluginConfig.host,
			port: pluginConfig.port
		});
		redisClient.on("error", function (err) {
			console.log('Redis connection error. The Redis flow node wont work until the connection is reestablished.');
			console.log(err);
		});
		redisClient.on('connect', function(){
			console.log('Connected to Redis');
		});
		redisClient.on('ready', function(){
			console.log('Redis is ready');
		});
		
		redisClient.on('end', function(){
			console.log('Disconnected from Redis');
		});
		
		return redisClient;
	} catch (error) {
		options.logger.error(`Failed to configure Redis: ${error}`);
		redisClient.quit();
		return null;
	}
}

module.exports = getPlugin;
