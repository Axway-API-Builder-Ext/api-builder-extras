const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const { search } = require('./actions/search');
const { getTemplate, putTemplate } = require('./actions/indexTemplate');
const { getMapping, putMapping } = require('./actions/indexMapping');
const { getILMPolicy, putILMPolicy } = require('./actions/ilmPolicy');
const { getRollupJobs, putRollupJob } = require('./actions/rollupJobs');
const { indicesRollover, indicesCreate, indicesExists } = require('./actions/indices');


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
