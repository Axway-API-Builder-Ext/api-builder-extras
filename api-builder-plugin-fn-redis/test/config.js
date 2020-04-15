module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-redis': {
			host: process.env.REDIS_HOST || 'localhost',
			port: parseInt(process.env.REDIS_PORT) || 6379,
			// those are usually not needed for testing so set to false
			registerHooks: false
		}
	}
};
