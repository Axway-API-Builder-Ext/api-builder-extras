const createRedisClient = require('./redis-client');

// Reconnects to Redis in case the flow-node has been registered
// with inactive connection - usually developer mode.
async function ensureClient(action, options) {
	if (!action.redisClient) {
		// In case the connection creation is deffered.
		// Usually happens in developer mode.
		if (!options.pluginConfig) {
			options.pluginConfig = action.pluginConfig;
		}
		action.redisClient = await createRedisClient(options);
	}
}

/**
 * Sets value to Redis.
 * @param {object} req - The flow request context passed in at runtime.  The
 *	 parameters are resolved as `req.params` and the available authorization
 * credentials are passed in as `req.authorizations`.
 * @param {object} outputs - A set of output callbacks.  Use it to signal an
 *	 event and pass the output result back to the runtime.  Only use an
 *	 output callback once and only after all asyncronous tasks complete.
 * @param {object} options - The additional options provided from the flow
 * 	 engine.
 * @param {object} The logger from API Builder that can be used to log messages
 * 	 to the console. See https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 *
 * @return {undefined}
 */
async function set(req, outputs, options) {
	await ensureClient(this, options);
	const key = req.params.key;
	let value = req.params.value;
	const expiremilliseconds = req.params.expiremilliseconds;
	
	if (!key) {
		return outputs.error(null, { message: 'Missing required parameter: key' });
	}
	if (typeof key !== 'string') {
		return outputs.error(null, { message: '\'key\' must be a string.' });
	}
	if (!value) {
		return outputs.error(null, { message: 'Missing required parameter: value' });
	}
	if (typeof value !== 'string' && !(value instanceof Date)) {
		value = JSON.stringify(value);
	}
	
	let result;
	try {
		if (expiremilliseconds) {
			result = await this.redisClient.set(key, value, 'PX', expiremilliseconds);
		} else {
			result = await this.redisClient.set(key, value);
		}
		return outputs.next(null, result);
	} catch (err) {
		return outputs.error(null, { message: err });
	}
}

/**
 * Gets value to Redis.
 * @param {object} req - The flow request context passed in at runtime.  The
 *	 parameters are resolved as `req.params` and the available authorization
 * credentials are passed in as `req.authorizations`.
 * @param {object} outputs - A set of output callbacks.  Use it to signal an
 *	 event and pass the output result back to the runtime.  Only use an
 *	 output callback once and only after all asyncronous tasks complete.
 * @param {object} options - The additional options provided from the flow
 * 	 engine.
 * @param {object} The logger from API Builder that can be used to log messages
 * 	 to the console. See https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 *
 * @return {undefined}
 */
async function get(req, outputs, options) {
	await ensureClient(this, options);
	const key = req.params.key;
	if (!key) {
		return outputs.error(null, { message: 'Missing required parameter: key' });
	}

	let result;
	try {
		result = await this.redisClient.get(key); // No result found for key: '${key}'
		if (!result) {
			return outputs.noResult(null, ``);
		} else {
			return outputs.next(null, result);
		}
	} catch (err) {
		return outputs.error(null, { message: err });
	}
}

module.exports = {
	set, get
};
