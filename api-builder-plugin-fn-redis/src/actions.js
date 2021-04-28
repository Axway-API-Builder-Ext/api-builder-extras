const createRedisClient = require('./redis-client');

// Reconnects to Redis in case the flow-node has been registered
// with inactive connection - usually developer mode.
async function ensureClient(options) {
	if (!options.pluginContext && !options.pluginContext.redisClient) {
		options.pluginContext.redisClient = await createRedisClient(options);
	}
}

/**
 * Sets value to Redis.
 * 
 * @param {object} params - A map of all the parameters passed from the flow.
 * @param {object} options - The additional options provided from the flow
 *	 engine.
 * @param {object} options.pluginConfig - The service configuration for this
 *	 plugin from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {object} options.logger - The API Builder logger which can be used
 *	 to log messages to the console. When run in unit-tests, the messages are
 *	 not logged.  If you wish to test logging, you will need to create a
 *	 mocked logger (e.g. using `simple-mock`) and override in
 *	 `MockRuntime.loadPlugin`.  For more information about the logger, see:
 *	 https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */
async function set(params, options) {
	await ensureClient(options);
	const key = params.key;
	let value = params.value;
	const expiremilliseconds = params.expiremilliseconds;
	
	if (!key) {
		throw new Error('Missing required parameter: key');
	}
	if (typeof key !== 'string') {
		throw new Error('\'key\' must be a string.');
	}
	if (!value) {
		throw new Error('Missing required parameter: value');
	}
	if (typeof value !== 'string' && !(value instanceof Date)) {
		value = JSON.stringify(value);
	}
	
	let result;
	if (expiremilliseconds) {
		options.logger.info(`Set to Redis cache with key: ${key} and expiremilliseconds: ${expiremilliseconds}`);
		result = await options.pluginContext.redisClient.set(key, value, 'PX', expiremilliseconds);
	} else {
		options.logger.info(`Set to Redis cache with key: ${key}`);
		result = await options.pluginContext.redisClient.set(key, value);
	}
	return result;
}

/**
 * Gets value to Redis.
 *
 * @param {object} params - A map of all the parameters passed from the flow.
 * @param {object} options - The additional options provided from the flow
 *	 engine.
 * @param {object} options.pluginConfig - The service configuration for this
 *	 plugin from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {object} options.logger - The API Builder logger which can be used
 *	 to log messages to the console. When run in unit-tests, the messages are
 *	 not logged.  If you wish to test logging, you will need to create a
 *	 mocked logger (e.g. using `simple-mock`) and override in
 *	 `MockRuntime.loadPlugin`.  For more information about the logger, see:
 *	 https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */
async function get(params, options) {
	await ensureClient(options);
	const key = params.key;
	if (!key) {
		throw new Error('Missing required parameter: key');
	}

	let result;
	result = await options.pluginContext.redisClient.get(key); // No result found for key: '${key}'
	if (!result) {
		options.logger.info(`Got no result from Redis cache for key: ${key}`);
		return options.setOutput('noResult', '');
	} else {
		options.logger.info(`Successfully got a result from Redis cache for key: ${key}`);
		return result;
	}
}

module.exports = {
	set, get
};
