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

async function indicesRollover(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.alias) {
		throw new Error('Missing required parameter: alias');
	}
	// The alias might be a string or an object 
	if(typeof params.alias === 'object') {
		if(Object.keys(params.alias).length === 0 && params.alias.constructor === Object) {
			throw new Error(`Given rollover alias object is empty.`);
		}
		for(var alias in params.alias) {
			params.alias = alias;
			break; // Only one alias is supported.
		}
	}
	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var result = await client.indices.rollover( params, { ignore: [404], maxRetries: 3 });

		return result;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

async function indicesCreate(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.index) {
		throw new Error('Missing required parameter: index');
	}
	try {
		var aliasName;
		if(params.alias) {
			aliasName = params.alias;
			delete params.alias;
			if(params.body) { // a body might be given
				if(params.body.aliases == undefined) {
					params.body.aliases = {};
				}
			} else {
				params.body = { aliases: { }};
			}
			params.body.aliases[aliasName] = {};
		}
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var result = await client.indices.create( params, { ignore: [404], maxRetries: 3 });

		return result;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

async function indicesExists(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.index && !params.name) {
		throw new Error('Either the parameter index, name (name of the alias) or both must be given');
	}

	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var result;
		// If the alias is given, we search for the alias in combination with the index
		if(params.name != undefined) {
			result = await client.indices.existsAlias( params, { ignore: [404], maxRetries: 3 });
		} else {
			// This searches for indices only
			result = await client.indices.exists( params, { ignore: [404], maxRetries: 3 });
		}
		if(result.statusCode == 404) {
			return options.setOutput('notFound', result);
		}

		return result;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}



module.exports = {
	indicesRollover, 
	indicesCreate, 
	indicesExists
};
