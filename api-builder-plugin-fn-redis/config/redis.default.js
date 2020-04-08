module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-redis': {
			// During development you may set the variables in conf/.env
			host: process.env.REDIS_NODE, 
			port: parseInt(process.env.REDIS_PORT) || 6379
		}
	}
};
