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

	var replaceWhenChanged = false;
	if(params.replaceWhenChanged != undefined) {
		replaceWhenChanged = params.replaceWhenChanged;
		delete params.replaceWhenChanged;
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
	debugger;
	var client = new ElasticsearchClient(elasticSearchConfig).client;
	try {
		var actualTransform;
		var actualTransformId
		// Get all active (RUNNING ONLY) transforms with the given Transform-ID
		const allTransforms = await client.transform.getTransformStats({ transformId: `${params.transformId}*` }, { ignore: [404], maxRetries: 3 });
		var runningTransforms = [];
		for (i = 0; i < allTransforms.body.transforms.length; i++) { 
			const transform = allTransforms.body.transforms[i];
			// Check if the Transform-ID+Suffix already exists
			if(transform.id==`${params.transformId}${idSuffix}`) {
				options.logger.info(`Transform found: ${params.transformId}${idSuffix} already exists with state: ${transform.state}`);
				if(startTransform && transform.state != "started" && transform.state != "indexing") {
					options.logger.info(`Existing transform: ${params.transformId}${idSuffix} is not running, going to start it.`);
					await client.transform.startTransform( {transformId: transform.id}, { ignore: [404], maxRetries: 3 });
					return transform;
				}
			}
			if(transform.state == "started" || transform.state == "indexing") {
				runningTransforms.push(transform);
			}
		}
		// If we have multiple transforms running, we cannot determine, which one should be used to compare the config with, 
		// But it's important to stop them, as we should have only ONE running at the same time
		if(runningTransforms.length>1) {
			for (i = 0; i < runningTransforms.length; i++) { 
				const runningTransform = runningTransforms[i];
				await client.transform.stopTransform( {transformId: runningTransform.id}, { ignore: [404], maxRetries: 3 });
			}
		} else if (runningTransforms.length==1) {
			// Otherwise we consider the currently running transform as to be the actual and load the configuration
			const response = await client.transform.getTransform( {transformId: runningTransforms[0].id}, { ignore: [404], maxRetries: 3 });
			actualTransform = response.body.transforms[0];
			actualTransformId = actualTransform.id;
		}

		// Compare the configuration with the currently running (actual) transform
		if(actualTransform != undefined && replaceWhenChanged) {
			delete actualTransform.id;
			delete actualTransform.create_time;
			delete actualTransform.version;
			if(JSON.stringify(actualTransform) === JSON.stringify(params.body)) {
				return options.setOutput('noUpdate', `No update required as desired Transform with new ID: '${params.transformId}${idSuffix}' equals to existing transform with ID: '${actualTransformId}'.`);
			}
		}

		// If an existing transform exists, the transform should be stopped as we only want one transform running at a time (this is by design of how this action works, not ES)
		if(actualTransform != undefined) {
			if(actualTransformId == params.transformId && idSuffix == "") {
				throw new Error(`Cannot replace existing transform using the same Transform-ID: '${actualTransformId}'. Please provide an ID-Suffix.`);
			}
			options.logger.info(`Existing Transform found: ${actualTransformId}. Going to stop before creating new transform.`);
			var stopResult = await client.transform.stopTransform( {transformId: actualTransformId, force: true}, { ignore: [404], maxRetries: 3 });
		} else {
			options.logger.info(`No running Transform found with primary ID: ${params.transformId}. Creating new transform with ID: '${params.transformId}${idSuffix}'.`);
		}
		params.transformId = `${params.transformId}${idSuffix}`;
		try {
			var putTransformResult = await client.transform.putTransform( params, { ignore: [404], maxRetries: 3 });
		} catch (e) {
			if(e.meta.statusCode == 409) {
				throw new Error(`Error creating the transform. The transform id: \'${params.transformId}\' was used previously. This includes deleted transforms.`);
			} else {
				throw e;
			}
		}
		if(startTransform) {
			options.logger.info(`Starting created transform with ID: ${params.transformId}`);
			await client.transform.startTransform( {transformId: params.transformId}, { ignore: [404], maxRetries: 3 });
		}
		if(deletePreviousTransform && actualTransformId) {
			options.logger.info(`Deleting previous transform with ID: ${actualTransformId}`);
			await client.transform.deleteTransform( {transformId: actualTransformId}, { ignore: [404], maxRetries: 3 });
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
