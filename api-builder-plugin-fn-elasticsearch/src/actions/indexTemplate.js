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

async function getTemplate(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.name) {
		throw new Error('Missing required parameter: name');
	}
	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var indexTemplate = await client.indices.getTemplate( params, { ignore: [404], maxRetries: 3 });

		if(Object.keys(indexTemplate.body).length === 0 && indexTemplate.body.constructor === Object) {
			return options.setOutput('notFound', `No index template found with name [${params.name}]`);
		}
		// Return the template config itself - Not the surrounding object based on the template name
		return indexTemplate.body[params.name];

	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
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

	var updateWhenChanged = false;
	if(params.updateWhenChanged != undefined) {
		updateWhenChanged = params.updateWhenChanged;
		delete params.updateWhenChanged;
	}
	var recreate = params.recreate;
	delete params.recreate;

	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var actualTemplate;
		// Use the index-template version to decide if the index should be updated or not
		if(updateWhenChanged) {
			// Get the current index-template based on the name
			const response = await client.indices.getTemplate({name: params.name}, { ignore: [404], maxRetries: 3 });
			actualTemplate = response.body[params.name];
			if(actualTemplate == undefined) {
				options.logger.info(`No index template found with name: ${params.name} creating new.`);
			} else {
				if(actualTemplate.version >= params.body.version) {
					if(recreate) {
						options.logger.info(`Desired index template version: ${params.body.version} is less or equal to actual version: ${actualTemplate.version}. Recreating index template anyway, as recreate is set.`);
					} else {
						return options.setOutput('noUpdate', `No update required as actual index template version: ${actualTemplate.version} is less or equal to desired version: ${params.body.version}`);
					}
				}
			}
		}
		if(actualTemplate != undefined) {
			// Take over existing aliases from the actual template
			params.body.aliases = {...actualTemplate.aliases};
			// Take over existing ILM Policies
			params.body.settings.index.lifecycle = {...actualTemplate.settings.index.lifecycle};
		}
		var result = await client.indices.putTemplate( params, { ignore: [404], maxRetries: 3 });

		return result;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

module.exports = {
	getTemplate, 
	putTemplate
};
