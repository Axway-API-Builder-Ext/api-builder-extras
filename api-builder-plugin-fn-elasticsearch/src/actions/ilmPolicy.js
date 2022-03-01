const { ElasticsearchClient } = require('./ElasticsearchClient');
var deepEqual = require('deep-equal')

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

async function getILMPolicy(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.policy) {
		throw new Error('Missing required parameter: policy');
	}
	debugger;
	try {
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		var result = await client.ilm.getLifecycle(params, { ignore: [404], maxRetries: 3 });

		if (result.status == 404) {
			return options.setOutput('notFound', `No ILM policy found with name [${params.policy}]`);
		}
		// Return the template config itself - Not the surrounding object based on the template name
		return result[params.policy];
	} catch (e) {
		if (e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

async function putILMPolicy(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.policy) {
		throw new Error('Missing required parameter: policy');
	}
	if (!params.body) {
		throw new Error('Missing required parameter: body');
	}
	var updateWhenChanged = false;
	if (params.updateWhenChanged != undefined) {
		updateWhenChanged = params.updateWhenChanged;
		delete params.updateWhenChanged;
	}
	var attachToIndexTemplate = "";
	if(params.attachToIndexTemplate != undefined) {
		attachToIndexTemplate = params.attachToIndexTemplate;
		delete params.attachToIndexTemplate;
	}
	debugger;

	try {
		var noUpdate = false;
		var client = new ElasticsearchClient(elasticSearchConfig).client;
		// Should the ILM-Policy be compared before updating it?
		if (updateWhenChanged) {
			// Get the current/actual ILM-Policy based on the policy name
			const response = await client.ilm.getLifecycle({ name: params.policy }, { ignore: [404], maxRetries: 3 });
			const actualILMPolicy = response[params.policy];
			if (actualILMPolicy == undefined) {
				options.logger.info(`No ILM-Policy found with name: ${params.policy} creating new.`);
			} else {
				if (deepEqual(actualILMPolicy.policy, params.body.policy)) {
					noUpdate = true;
				}
			}
		}
		if(!noUpdate) {
			var result = await client.ilm.putLifecycle(params, { ignore: [404], maxRetries: 3 });
		}
		// Perhaps the policy should be attached to some index templates (format is: templateName1, templateName2 or templateName1:alias, templateName2)
		if(attachToIndexTemplate != undefined) {
			const templates = attachToIndexTemplate.split(",");
			
			for (var i = 0; i < templates.length; ++i) {
				try {
					var field = templates[i].trim();
					var templateName = field.split(":")[0];
					var aliasName = field.split(":")[1];

					var response = await client.indices.getTemplate({name: templateName}, { ignore: [404], maxRetries: 3 });
					const indexTemplate = response[templateName];
					if(indexTemplate == undefined) {
						options.logger.error(`Error adding ILM-Policy: ${params.policy} to index template: ${templateName}. Index-Template not found!`);
						continue;
					}
					var lifecycle = {
						name: params.policy, 
						rollover_alias: aliasName
					}
					if(indexTemplate.settings.index.lifecycle == undefined || !deepEqual(indexTemplate.settings.index.lifecycle, lifecycle)) {
						indexTemplate.settings.index.lifecycle = {
							name: params.policy, 
							rollover_alias: aliasName
						}
						options.logger.info(`Assigning ILM-Policy: ${params.policy} to index template: ${templateName} with alias: ${aliasName}.`);
						var response = await client.indices.putTemplate({ name: templateName, body: indexTemplate}, { ignore: [404], maxRetries: 3 });
					} else {
						options.logger.info(`ILM-Policy: ${params.policy} already assigned to index template: ${templateName} with alias: ${aliasName}.`);
					}

				} catch (e) {
					options.logger.error(`Error adding ILM-Policy to index template: ${JSON.stringify(e)}`);
				}
			}
		}
		if(noUpdate) {
			return options.setOutput('noUpdate', `No update required as desired ILM-Policy equals to existing policy.`);
		}
		return result;
	} catch (e) {
		if (e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

module.exports = {
	getILMPolicy,
	putILMPolicy
};
