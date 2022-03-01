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

async function getRollupJobs(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.id) {
		throw new Error('Missing required parameter: id');
	}

	var client = new ElasticsearchClient(elasticSearchConfig).client;
	var result = await client.rollup.getJobs( params, { ignore: [404], maxRetries: 3 });

	if(result.jobs.length == 0) {
		return options.setOutput('notFound', `No Rollup job found with id [${params.id}]`);
	}
	if(result.jobs.length > 1) {
		throw new Error(`Got ${result.jobs.length} Rollup jobs. Only one unique flow node is currently supported.`);
	}
	return result.jobs[0];
}

async function putRollupJob(params, options) {
	const elasticSearchConfig = options.pluginConfig.elastic;

	if (typeof elasticSearchConfig.node === 'undefined' && typeof elasticSearchConfig.nodes === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: nodes or node is missing.');
		throw new Error('Elasticsearch configuration is invalid: nodes or node is missing.');
	}
	if (!params.id) {
		throw new Error('Missing required parameter: id');
	}
	if (!params.body) {
		throw new Error('Missing required parameter: body');
	}
	var startJob = true;
	if(params.startJob != undefined) {
		startJob = params.startJob;
		delete params.startJob;
	}

	var replaceWhenChanged = false;
	if(params.replaceWhenChanged != undefined) {
		replaceWhenChanged = params.replaceWhenChanged;
		delete params.replaceWhenChanged;
	}

	var deletePreviousJob = false;
	if(params.deletePreviousJob != undefined) {
		deletePreviousJob = params.deletePreviousJob;
		delete params.deletePreviousJob;
	}

	var jobIdSuffix = `-${params.idSuffix}`
	if(params.idSuffix == undefined) {
		jobIdSuffix = "";
	}
	delete params.idSuffix;

	var client = new ElasticsearchClient(elasticSearchConfig).client;
	try {
		var actualJob;
		var actualJobId
		// Get all active (RUNNING ONLY) jobs with the given Job-ID
		const allJobs = await client.rollup.getJobs({ id: "_all" }, { ignore: [404], maxRetries: 3 });
		var runningJobs = [];
		for (i = 0; i < allJobs.jobs.length; i++) { 
			const job = allJobs.jobs[i];
			if(job.config.id.startsWith(params.id) && job.status.job_state == "started") {
				runningJobs.push(job);
			}
		}
		// If we have multiple jobs running, we cannot determine, which one should be used to compare the config with, hence we are stopping all and create a new
		if(runningJobs.length>1) {
			for (i = 0; i < runningJobs.length; i++) { 
				const runningJob = runningJobs[i];
				await client.rollup.stopJob( {id: runningJob.config.id}, { ignore: [404], maxRetries: 3 });
			}
		} else {
			// Otherwise we consider the currently running job as to be the actual job
			actualJob = runningJobs[0];
		}
		if(actualJob != undefined) {
			actualJobId = actualJob.config.id;
		}

		// Compare the configuration with the currently running (actual) job
		if(actualJob != undefined && replaceWhenChanged) {
			delete actualJob.config.id;
			if(JSON.stringify(actualJob.config) === JSON.stringify(params.body)) {
				return options.setOutput('noUpdate', `No update required as desired Rollup-Job with new ID: '${params.id}${jobIdSuffix}' equals to existing job with ID: '${actualJobId}'.`);
			}
		}

		// If an existing job exists, the job should be stopped as we want only one job running at a time (this is by design of how this action works, not ES)
		if(actualJob != undefined) {
			if(actualJobId == params.id && jobIdSuffix == "") {
				throw new Error(`Cannot replace existing Rollup job using the same Job-ID: '${actualJobId}'. Please provide an ID-Suffix.`);
			}
			options.logger.info(`Existing Rollup-Job found: ${actualJobId}. Going to stop before creating new job.`);
			var stopResult = await client.rollup.stopJob( {id: actualJobId}, { ignore: [404], maxRetries: 3 });
		} else {
			options.logger.info(`No running Rollup-Job found with primary ID: ${params.id}. Creating new job with ID: '${params.id}${jobIdSuffix}'.`);
		}
		params.id = `${params.id}${jobIdSuffix}`;
		try {
			var putJobResult = await client.rollup.putJob( params, { ignore: [404], maxRetries: 3 });
		} catch (e) {
			if(e.meta.statusCode == 409) {
				throw new Error(`Error creating the rollup job. The rollup job id: \'${params.id}\' was used previously. This includes deleted jobs.`);
			} else {
				throw e;
			}
		}
		if(startJob) {
			await client.rollup.startJob( {id: params.id}, { ignore: [404], maxRetries: 3 });
		}
		if(deletePreviousJob && actualJobId) {
			await client.rollup.deleteJob( {id: actualJobId}, { ignore: [404], maxRetries: 3 });
		}
		return putJobResult;
	} catch (e) {
		if(e instanceof Error) throw e;
		throw new Error(JSON.stringify(e));
	}
}

module.exports = {
	getRollupJobs, 
	putRollupJob
};
