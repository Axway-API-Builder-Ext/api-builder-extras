const { ElasticsearchClient } = require('./ElasticsearchClient');

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
 * 	 to the console. See https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/project/logging/index.html
 *
 * @return {undefined}
 */

async function indexDocument(params, options) {
	const { index, body, addTimestamp} = params;
	const elasticSearchConfig = options.pluginConfig.elastic;
	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}

	// Getting the client (which is a singleton)
	var client = new ElasticsearchClient(elasticSearchConfig).client;

	if(!index) {
		throw new Error(`Missing required parameter: index`);
	}
	if(!body) {
		throw new Error(`Missing required parameter: body`);
	}
	// If a timestamp field is given, add the timestamp to the body
	if(addTimestamp) {
		body[addTimestamp] = Date.now();
		delete params.addTimestamp;
	}
	debugger;
	var result;
	try {
		result = await client.index( params, { ignore: [404], maxRetries: 3 });
	} catch (ex) {
		if(ex instanceof Error) throw ex;
		throw new Error(JSON.stringify(ex));
	}
	if(result.result!="created") {
		throw new Error(JSON.stringify(result));
	}
	return result;
}

module.exports = {
	indexDocument
};
