module.exports = {
	pluginConfig: {
		// During development you may set the environment variables in conf/.env
		// More info at: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/environmentalization.html
		'@axway-api-builder-ext/api-builder-plugin-fn-redis': {			
			host: process.env.REDIS_HOST, // Redis server location
			port: parseInt(process.env.REDIS_PORT) || 6379, // Redis server port
			password: process.env.REDIS_PASSWORD, // Password for the Redis connection
			registerHooks: true // When true register callbacks to be excuted on runtime lifecycle events
		}
	}
};
