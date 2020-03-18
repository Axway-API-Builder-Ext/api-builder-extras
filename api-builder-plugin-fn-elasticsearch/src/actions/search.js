const { client, getClient } = require('./_common')

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

function search(req, outputs, options) {
	debugger;
	const node = this.pluginConfig.elastic.node;
	if (typeof node === 'undefined') {
		options.logger.error('Elasticsearch configuration is invalid: node is missing.');
		return outputs.error(null, { message: 'Elasticsearch configuration is invalid: node is missing.' });
	}
	if(!client.isMocked) {
		getClient(node);
	}

	addSuggestModeDefault();
	const searchBody = {};
	if(req.params.index != undefined) searchBody.index = req.params.index;
	if(req.params.query != undefined) {
		searchBody.body = {};
		searchBody.body.query = req.params.query;
	}
	addQueryParam('from');
	addQueryParam('size');
	addQueryParam('sort');
	addQueryParam('_source');
	addQueryParam('_source_excludes');
	addQueryParam('_source_includes');
	addQueryParam('allow_no_indices'); 
	addQueryParam('allow_partial_search_results'); 
//	addQueryParam('default_operator'); // Seems not supported by the Node-Library
	addQueryParam('request_cache'); 
	addQueryParam('rest_total_hits_as_int'); 
	addQueryParam('batched_reduce_size'); 
	addQueryParam('ccs_minimize_roundtrips'); 
//	addQueryParam('df'); 
	addQueryParam('docvalue_fields');
	addQueryParam('expand_wildcards'); 
	addQueryParam('explain'); 
	addQueryParam('ignore_throttled'); 
	addQueryParam('ignore_unavailable'); 
	addQueryParam('lenient'); 
	addQueryParam('max_concurrent_shard_requests'); 
	addQueryParam('pre_filter_shard_size'); 
	addQueryParam('preference'); 
	addQueryParam('q'); 
	addQueryParam('routing'); 
	addQueryParam('search_type'); 
	addQueryParam('seq_no_primary_term'); 
	addQueryParam('stats'); 
	addQueryParam('stored_fields'); 
	addQueryParam('suggest_field'); 
	addQueryParam('suggest_mode'); 
	addQueryParam('suggest_size'); 
	addQueryParam('suggest_text'); 
	addQueryParam('terminate_after'); 
	addQueryParam('timeout'); 
	addQueryParam('track_scores'); 
	addQueryParam('track_total_hits'); 
	addQueryParam('typed_keys'); 
	addQueryParam("version");
	
	options.logger.debug(`Using elastic search query body: ${JSON.stringify(searchBody)}`);
	client.search(searchBody, {
		ignore: [404],
		maxRetries: 3
	}, (err, result) => {
		if(err) {
			if(!err.body) {
				options.logger.error(`Error returned from Elastic-Search: ${JSON.stringify(err)}`);
			}
			return outputs.error(null, err.body.error);
		} else if(result.error) {
			return outputs.error(null, result.error);
		} else {
			return outputs.next(null, result);
		}
	});

	function addQueryParam(field) {
		//if(searchBody.querystring == undefined) searchBody.querystring = {};
		if(req.params[field] != undefined) searchBody[field] = req.params[field];
	}

	function addSuggestModeDefault() {
		if(req.params.suggest_field != undefined) {
			if(req.params.suggest_mode == undefined) req.params.suggest_mode = 'missing';
		}
	}
}

module.exports = {
	search
};
