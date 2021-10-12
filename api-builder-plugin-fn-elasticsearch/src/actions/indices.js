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

async function indicesRollover(params, options) {
	var { alias, wildcardAlias } = params;
	var { logger } = options;
	var client = new ElasticsearchClient().client;
	if (!alias) {
		throw new Error('Missing required parameter: alias');
	}
	var aliasesToRollover = [];
	// The alias might be a string or an object 
	if(typeof alias === 'object') {
		for(var alias in alias) {
			aliasesToRollover.push(alias);
			break; // Only one alias is supported.
		}
	} else {
		aliasesToRollover.push(alias);
	}
	/* Is the given alias is a wildcard (e.g. apigw-traffic-summary-*), search for other aliases starting with this alias
	 * This the result we may get
	 * alias                   index                          filter routing.index routing.search is_write_index
	 * apigw-trace-messages-us apigw-trace-messages-us-000002 -      -             -              true
	 * apigw-trace-messages-us apigw-trace-messages-us-000001 -      -             -              false
	 * apigw-trace-messages-eu apigw-trace-messages-us-000001 -      -             -              false
	 * apigw-trace-messages-eu apigw-trace-messages-us-000002 -      -             -              false
	 * apigw-trace-messages-eu apigw-trace-messages-us-000003 -      -             -              true
	 * 
	 * For each found alias it must be rolled once, hence it must be the write index
	 */
	if(wildcardAlias) {
		aliasesToRollover = [];
		logger.debug(`Rolling over all indicies starting with alias: ${alias}`);
		var foundAliases = await client.indices.getAlias({name: `${alias}*`}, { ignore: [404], maxRetries: 3 });
		// Based on the alias name we get all indicies
		for (const [key, value] of Object.entries(foundAliases.body)) {
			for (const [aliasName, aliasSettings] of Object.entries(value.aliases)) {
				// Each can have only one write index, which we use to perform the rollover
				if(aliasSettings.is_write_index) {
					logger.debug(`Adding is write alias: ${aliasName} to the list of aliases to rollover`);
					aliasesToRollover.push(aliasName);
					break;
				}
			}
		}
	}
	if(aliasesToRollover.length == 0) {
		throw new Error(`No index found to rollover for alias: ${JSON.stringify(alias)}`);
	}
	try {
		var result = [];
		for(alias of aliasesToRollover) {
			logger.debug(`Rolling over index: ${alias}`);
			var rolloverResult = await client.indices.rollover( { alias: alias }, { ignore: [404], maxRetries: 3 });
			result.push(rolloverResult);
		}
		return result;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

async function indicesCreate(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;
	const { index, alias, indexTemplate } = params;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!index) {
		throw new Error('Missing required parameter: index');
	}
	try {
		if(alias) {
			if(params.body) { // a body might be given
				if(params.body.aliases == undefined) {
					params.body.aliases = {};
				}
			} else {
				params.body = { aliases: { }};
			}
			params.body.aliases[alias] = {};
			delete params.alias;
		}
		// Check if the index template exists
		if(indexTemplate) {
			var client = new ElasticsearchClient(elasticSearchConfig).client;
			var result = await client.indices.existsTemplate( { name: indexTemplate }, { maxRetries: 3 });
			if(result.statusCode == 404) {
				throw new Error(`The index template: '${indexTemplate}' is missing. Index wont be created.`);
			}
			delete params.indexTemplate;
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
