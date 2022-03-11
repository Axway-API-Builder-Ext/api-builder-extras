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

	var limitOnLastCheckpoint = true;
	if(params.limitOnLastCheckpoint != undefined) {
		limitOnLastCheckpoint = params.limitOnLastCheckpoint;
		delete params.limitOnLastCheckpoint;
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
		const allTransforms = await client.transform.getTransformStats({ transformId: `${params.transformId}*` }, { ignore: [404], maxRetries: 3 });
		var runningTransforms = [];
		for (i = 0; i < allTransforms.body.transforms.length; i++) { 
			const transform = allTransforms.body.transforms[i];
			// Check if the requested Transform (TransformId+ID-Suffix) already exists, which means nothing to do
			if(transform.id==`${params.transformId}${idSuffix}`) {
				options.logger.info(`Transform found: ${params.transformId}${idSuffix} already exists with state: ${transform.state}. To update this transform, please provide an idSuffix (e.g. v2)`);
				if(startTransform && transform.state != "started" && transform.state != "indexing") {
					options.logger.info(`Existing transform: ${params.transformId}${idSuffix} is not running, going to start it.`);
					await client.transform.startTransform( {transformId: transform.id}, { ignore: [404], maxRetries: 3 });					
				}
				actualTransform = transform;
			} else {
				if(transform.state == "started" || transform.state == "indexing") {
					runningTransforms.push(transform);
				}
			}
		}
		// The transform with the same transformId (incl. the ID-Suffix) is found and running - Nothing to do
		if(actualTransform) return actualTransform;

		// If only one Transform is running with the transformId* it is considered as the currently active transform, which is used to take over the last checkpoint
		// as a query limitation to the new transform to avoid re-indexing everything again
		if(limitOnLastCheckpoint) {
			if(runningTransforms.length == 1) {
				var runningTransform = runningTransforms[0];
				var z = 0;
				// As long as the index is still running, there is no completed checkpoint, hence we have to wait
				while(runningTransform.state == "indexing" && z < 12) {
					options.logger.warn(`Existing transform: ${runningTransform} is currently indexing. Waiting max. 60 seconds.`);
					await sleep(5000);
					var response = await client.transform.getTransformStats( {transformId: runningTransform.id}, { ignore: [404], maxRetries: 3 });
					runningTransform = response.body.transforms[0]; // Only one transform is expected as requested for specific transformId which is unique
					z++;
				}
				// If the transform is still indexing - Don't try to update it
				if(runningTransform.state == "indexing") {
					return options.setOutput('noUpdate', `No update possible, as the actual transform: ${runningTransform.id} is still indexing.`);
				}
				if(!runningTransform.checkpointing || !runningTransform.checkpointing.last) {
					return options.setOutput('noUpdate', `Existing transform: ${JSON.stringify(runningTransform)} has no last checkpoint. Cannot update transform.`);
				}
				var lastTimeStamp = runningTransform.checkpointing.last.time_upper_bound_millis;
				if(!lastTimeStamp) {
					return options.setOutput('noUpdate', `lastTimeStamp is missing in existing running transform: ${JSON.stringify(runningTransform)}. Cannot update transform.`);
				}
				// Take over the last timestamp as a query limitation to the new transform
				params.body.source.query = { "bool": { "should": [ { "range": { "@timestamp": { "gt": lastTimeStamp } } } ],"minimum_should_match": 1 } };
			} else if(runningTransforms.length > 1) {
				options.logger.warn(`Expected only ONE transform running with transformId: ${params.transformId}, but found ${runningTransforms.length}`);
			} else if(runningTransforms.length > 0) {
				options.logger.warn(`No running transforms found with transformId: ${params.transformId}. Cannot take over last checkpoint to new transform`);
			}
		}
		// Stop all other eventually running transforms with the same transformId*, as we expect only one transform with the same transformid* to run
		for (var i = 0; i < runningTransforms.length; ++i) {
			await client.transform.stopTransform( {transformId: runningTransforms[i].id}, { ignore: [404], maxRetries: 3 });
		}
		params.transformId = `${params.transformId}${idSuffix}`;
		try {
			var putTransformResult = await client.transform.putTransform( params, { ignore: [404], maxRetries: 3 });
		} catch (e) {
			if(e.meta.statusCode == 409) {
				throw new Error(`Error creating the transform. The transform id: \'${params.transformId}\' was used previously. This includes even deleted transforms.`);
			} else {
				throw e;
			}
		}
		if(startTransform) {
			options.logger.info(`Starting created transform with ID: ${params.transformId}`);
			await client.transform.startTransform( {transformId: params.transformId}, { ignore: [404], maxRetries: 3 });
		}
		if(deletePreviousTransform && runningTransforms.length == 1) {
			options.logger.info(`Deleting previous transform with ID: ${runningTransforms[0].id}`);
			await client.transform.deleteTransform( {transformId: runningTransforms[0].id}, { ignore: [404], maxRetries: 3 });
		}
		return putTransformResult;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

module.exports = {
	putTransform
};
