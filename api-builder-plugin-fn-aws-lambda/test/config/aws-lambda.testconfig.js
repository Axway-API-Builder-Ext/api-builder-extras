module.exports = {
	// The configuration settings for your Swagger service.
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-aws-lambda': {
			'aws': {
				credentials: {
					region: "us-east-1",
					accessKeyId: "PROVIDE_YOUR_AWS_ACCESS_KEY_ID",
					secretAccessKey: "PROVIDE_YOUR_AWS_SECRET"
				}
			}
		}
	}
};
