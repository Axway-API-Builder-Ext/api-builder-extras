module.exports = {
	// The configuration settings for your Swagger service.
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-aws-lambda': {
			'aws': {
				credentials: {
					region: "us-east-1",
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_ATHENA_SECRET
				}
			}
		}
	}
};
