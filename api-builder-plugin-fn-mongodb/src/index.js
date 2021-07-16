const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');
const { MongoClient } = require('mongodb');
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
	let mongoClient;
	let mongoCollection;
	if(pluginConfig.mongoTestClient) {
		mongoClient = pluginConfig.mongoTestClient;
		mongoCollection = pluginConfig.mongoTestCollection;
	} else {
		try {
			// Create a connection to MongoDB on startup
			mongoClient = new MongoClient(pluginConfig.url);
			options.logger.debug(`Trying to connect to MongoDB: ${pluginConfig.url}`);
			await mongoClient.connect();
			options.logger.debug(`Selecting MongoDB collection: ${pluginConfig.collection}`);
			mongoCollection = mongoClient.db().collection(pluginConfig.collection);
			options.logger.info(`Successfully connected to MongoDB: ${pluginConfig.url} using collection: ${pluginConfig.collection}`);
		} catch (ex) {
			options.logger.error(
				`Failed to connect to MongoDB: ${pluginConfig.url}. Make sure MongoDB is running and conf/mongodb.default.js is configured. Perhaps set the environment variables: MONGODB_URL and MONGODB_COLLECTION in your .env file.`
			);
			if (!isDeveloperMode()) {
				// In development mode we allow to defer the obtaining of successfull MongoDB connection.
				// The promise is rejected only in production.
				return Promise.reject(ex);
			}
		}
	}

	const sdk = new SDK({ pluginConfig });
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions, { pluginContext: { mongoClient: mongoClient, mongoCollection: mongoCollection } });
	return sdk.getPlugin();
}

module.exports = getPlugin;
