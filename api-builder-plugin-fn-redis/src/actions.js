
/**
 * Action method.
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
async function set(req, outputs) {
	const key = req.params.key;
	let value = req.params.value;
	if (!key) {
		return outputs.error(null, {message: 'Missing required parameter: key'});
	}
	if (typeof key !== 'string') {
		return outputs.error(null, {message: '\'key\' must be a string.'});
	}
	if (!value) {
		return outputs.error(null, {message: 'Missing required parameter: value'});
	}
	if(typeof value !== 'string' && !(value instanceof Date)) {
		value = JSON.stringify(value);
	}

	let result;
	try {
		result = await this.redisClient.set(key, value);
		return outputs.next(null, result);
	} catch (err) {
		return outputs.error(null, {message: err});
	}
}

async function get(req, outputs) {
	const key = req.params.key;
	if (!key) {
		return outputs.error(null, {message: 'Missing required parameter: key'});
	}

	let result;
	try {
		result = await this.redisClient.get(key);
		if(!result) {
			return outputs.error(null, {message: `No result found for key: '${key}'`});
		} else {
			return outputs.next(null, result);
		}
	} catch (err) {
		return outputs.error(null, {message: err});
	}
}

async function quit(req, outputs) {
	let result;
	try {
		result = await this.redisClient.quit();
		if(!result) {
			return outputs.error(null, {message: `Problem while quiting Redis`});
		} else {
			return outputs.next(null, result);
		}
	} catch (err) {
		return outputs.error(null, {message: err});
	}
}

async function info(req, outputs) {
	let result;
	try {
		result = await this.redisClient.info();
		if(!result) {
			return outputs.error(null, {message: `Problem while obtaining Redis info`});
		} else {
			return outputs.next(null, result);
		}
	} catch (err) {
		return outputs.error(null, {message: err});
	}
}

module.exports = {
	set, get, quit, info
};
