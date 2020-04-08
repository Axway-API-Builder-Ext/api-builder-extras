const redis = require("redis");

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
function set(req, outputs, options) {
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
	debugger;
	if(typeof value !== 'string' && !(value instanceof Date)) {
		value = JSON.stringify(value);
	}

	this.redisClient.set(key, value, function(err, result) {
		if(err) {
			return outputs.error(null, {message: err});
		}
		return outputs.next(null, result);
	})
}

function get(req, outputs, options) {

	const key = req.params.key;

	if (!key) {
		return outputs.error(null, {message: 'Missing required parameter: key'});
	}

	this.redisClient.get(key, function(err, result) {
		if(err) {
			return outputs.error(null, {message: err});
		}
		if(!result) {
			return outputs.error(null, {message: `No result found for key: '${key}'`});
		}
		return outputs.next(null, result);
	});
}

module.exports = {
	set, get
};
