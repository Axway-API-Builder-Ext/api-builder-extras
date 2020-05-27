const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions')();
const solace = require('solclientjs').debug;
const { isDeveloperMode } = require('./utils');

/**
 * Resolves the API Builder plugin.
 * @param {object} pluginConfig - The service configuration for this plugin
 *   from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {string} [pluginConfig.proxy] - The configured API-builder proxy server
 * @param {object} options - Additional options and configuration provided by API Builder
 * @param {string} options.appDir - The current directory of the service using the plugin
 * @param {string} options.logger - An API Builder logger scoped for this plugin
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK({ pluginConfig });
	try {
		// Initialize factory with the most recent API defaults
		const factoryProps = new solace.SolclientFactoryProperties();
		factoryProps.profile = solace.SolclientFactoryProfiles.version10;
		solace.SolclientFactory.init(factoryProps);
		solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);
	} catch (ex) {
		options.logger.error(
			`Failed to connect to Solace server: ${pluginConfig.host}:${pluginConfig.port}. Make sure Solace server is running and conf/solace.default.js is configured`
		);
		if (!isDeveloperMode()) {
			// In development mode we allow to defer the obtaining of successfull Redis connection.
			// The promise is rejected only in production.
			return Promise.reject(ex);
		}
	}
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions, { pluginContext: { solace } });
	return sdk.getPlugin();
}

module.exports = getPlugin;
