module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-redis': {
			// When host is set to 'MOCK' all call to Redis are mocked
			host: 'MOCK', 
			//host: 'api-env', 
			port: '16379'
		}
	}
};
