const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const { search } = require('./actions/search');
const { getTemplate, putTemplate } = require('./actions/indexTemplate');
const { getMapping, putMapping } = require('./actions/indexMapping');
const { getILMPolicy, putILMPolicy } = require('./actions/ilmPolicy');
const { getRollupJobs, putRollupJob } = require('./actions/rollupJobs');
const { indicesRollover, indicesCreate, indicesExists } = require('./actions/indices');
const { ElasticsearchClient } = require('./actions/ElasticsearchClient');
const { isDeveloperMode } = require('./utils');


/**
 * Resolves the API Builder plugin.
 * @param {object} pluginConfig - The service configuration for this plugin
 *   from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {string} pluginConfig.proxy - The configured API-builder proxy server
 * @param {object} options - Additional options and configuration provided by API Builder
 * @param {string} options.appDir - The current directory of the service using the plugin
 * @param {string} options.logger - An API Builder logger scoped for this plugin
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	// Create a connection to Elasticsearch on startup
	var client = new ElasticsearchClient(pluginConfig.elastic).client;
	// Validate a healthy connection
	if (!isDeveloperMode() && !client.isMocked) {
		try {
			options.logger.info(`Validating connection to Elasticsearch: ${pluginConfig.elastic.nodes} ...`);
			await client.ping({requestTimeout: 3000});
			options.logger.info(`Connection to Elasticsearch: ${pluginConfig.elastic.nodes} successfully established.`);
		} catch (ex) {
			options.logger.error(`Connection to Elasticsearch: ${pluginConfig.elastic.nodes} not working. Error message: ${ex}`);
			// In development mode we allow to defer the obtaining of successfull Elasticsearch connection.
			// The promise is rejected only in production.
			return Promise.reject(ex);
		}
	}
	const sdk = new SDK({ pluginConfig });
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), {
		search,
		getTemplate,
		putTemplate,
		getMapping,
		putMapping,
		getILMPolicy,
		putILMPolicy,
		getRollupJobs,
		putRollupJob,
		indicesRollover,
		indicesCreate,
		indicesExists
	}, pluginConfig);
	const plugin = sdk.getPlugin();
	return plugin;
}

module.exports = getPlugin;
