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
 * 	 to the console. See https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 *
 * @return {undefined}
 */

async function getTemplate(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.name) {
		throw new Error('Missing required parameter: name');
	}

	var client = new ElasticsearchClient(elasticSearchConfig).client;
	var indexTemplate = await executeRequest(params);

	if(Object.keys(indexTemplate.body).length === 0 && indexTemplate.body.constructor === Object) {
		return options.setOutput('notFound', `No index template found with name [${params.name}]`);
	}
	// Return the template config itself - Not the surrounding object based on the template name
	return indexTemplate.body[params.name];

	function executeRequest(params) {
		return new Promise((resolve, reject) => {
			client.indices.getTemplate( params, { ignore: [404], maxRetries: 3 }, (err, result) => {
				if(err) {
					if(!err.body) {
						options.logger.error(`Error returned from Elastic-Search: ${JSON.stringify(err)}`);
					}
					reject(err.body.error.root_cause[0].reason);
				} else if(result.error) {
					reject(result.error);
				} else {
					resolve(result);
				}
			});
	
		})
	}
}

async function putTemplate(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.name) {
		throw new Error('Missing required parameter: name');
	}
	if (!params.body) {
		throw new Error('Missing required parameter: body');
	}

	var client = new ElasticsearchClient(elasticSearchConfig).client;
	var result = await executeRequest();

	if(Object.keys(result.body).length === 0 && result.body.constructor === Object) {
		throw new Error(`No index template found with name [${name}]`);
	}
	return result;

	function executeRequest() {
		return new Promise((resolve, reject) => {
			client.indices.putTemplate( params, { ignore: [404], maxRetries: 3 }, (err, result) => {
				if(err) {
					if(!err.body) {
						options.logger.error(`Error returned from Elastic-Search: ${JSON.stringify(err)}`);
					}
					reject(err.body.error.root_cause[0].reason);
				} else if(result.error) {
					reject(result.error);
				} else {
					resolve(result);
				}
			});
	
		})
	}
}

module.exports = {
	getTemplate, 
	putTemplate
};
