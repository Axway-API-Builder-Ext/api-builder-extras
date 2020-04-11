module.exports = {
	// The configuration settings for your Swagger service.
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-aws-lambda': {
			'aws': {
				credentials: {
					region: "us-east-1",
					accessKeyId: 'MOCK',
					secretAccessKey: 'MOCK'
				}
			}
		}
	}
};
