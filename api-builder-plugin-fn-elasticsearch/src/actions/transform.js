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

async function putTransform(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;
	
	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.transformId) {
		throw new Error('Missing required parameter: transformId');
	}
	if (!params.body) {
		throw new Error('Missing required parameter: body');
	}
	var startTransform = true;
	if(params.startTransform != undefined) {
		startTransform = params.startTransform;
		delete params.startTransform;
	}

	var deletePreviousTransform = false;
	if(params.deletePreviousTransform != undefined) {
		deletePreviousTransform = params.deletePreviousTransform;
		delete params.deletePreviousTransform;
	}

	var idSuffix = `-${params.idSuffix}`
	if(params.idSuffix == undefined) {
		idSuffix = "";
	}
	delete params.idSuffix;

	var client = new ElasticsearchClient(elasticSearchConfig).client;
	try {
		var actualTransform;
		var actualTransformId
		// Get all active (RUNNING ONLY) transforms with the given primary Transform-ID
		debugger;
		const allTransforms = await client.transform.getTransformStats({ transform_id: `${params.transformId}*` }, { ignore: [404], maxRetries: 3, allowNoMatch: true });
		var runningTransforms = [];
		for (i = 0; i < allTransforms.transforms.length; i++) { 
			const transform = allTransforms.transforms[i];
			// Check if the Transform already exists, which means nothing to do
			if(transform.id==`${params.transformId}${idSuffix}`) {
				options.logger.info(`Transform found: ${params.transformId}${idSuffix} already exists with state: ${transform.state}. To update this transform, please provide an idSuffix (e.g. v2)`);
				if(startTransform && transform.state != "started" && transform.state != "indexing") {
					options.logger.info(`Existing transform: ${params.transformId}${idSuffix} is not running, going to start it.`);
					await client.transform.startTransform( {transform_id: transform.id}, { ignore: [404], maxRetries: 3 });
				}
				actualTransform = transform;
			} else {
				// Stop all other transforms 
				if(transform.state == "started" || transform.state == "indexing") {
					await client.transform.stopTransform( {transform_id: transform.id}, { ignore: [404], maxRetries: 3 });
				}
			}
		}
		if(actualTransform) return actualTransform;
		// Stop all running transforms, as we expect only one transform to run
		for (i = 0; i < runningTransforms.length; i++) { 
			const runningTransform = runningTransforms[i];
			await client.transform.stopTransform( {transform_id: runningTransform.id}, { ignore: [404], maxRetries: 3 });
		}

		params.transform_id = `${params.transformId}${idSuffix}`;
		delete params.transformId; // Currently not supported by the JS-Library (See https://github.com/elastic/elasticsearch-js/issues/1645)
		try {
			var putTransformResult = await client.transform.putTransform( params, { ignore: [404], maxRetries: 3 });
		} catch (e) {
			if(e.meta.statusCode == 409) {
				throw new Error(`Error creating the transform. The transform id: \'${params.transform_id}\' was used previously. This includes deleted transforms.`);
			} else {
				throw e;
			}
		}
		if(startTransform) {
			options.logger.info(`Starting created transform with ID: ${params.transform_id}`);
			await client.transform.startTransform( {transform_id: params.transform_id}, { ignore: [404], maxRetries: 3 });
		}
		if(deletePreviousTransform && actualTransformId) {
			options.logger.info(`Deleting previous transform with ID: ${actualTransformId}`);
			await client.transform.deleteTransform( {transform_id: actualTransformId}, { ignore: [404], maxRetries: 3 });
		}
		return putTransformResult;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

module.exports = {
	putTransform
};
