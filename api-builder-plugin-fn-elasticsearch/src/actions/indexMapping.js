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

async function getMapping(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.index) {
		throw new Error('Missing required parameter: index');
	}
	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var result = await client.indices.getMapping( params, { ignore: [404], maxRetries: 3 });

		if((Object.keys(result.body).length === 0 && result.body.constructor === Object) || result.statusCode == 404) {
			throw new Error(`No mapping found for index [${params.index}]`);
		}
		return result;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

async function putMapping(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.index) {
		throw new Error('Missing required parameter: index');
	}
	if (!params.body) {
		throw new Error('Missing required parameter: body');
	}
	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var result = await client.indices.putMapping( params, { ignore: [404], maxRetries: 3 });

		if(Object.keys(result.body).length === 0 && result.body.constructor === Object) {
			throw new Error(`No index template found with name [${name}]`);
		}
		return result;

	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

module.exports = {
	getMapping, 
	putMapping
};
