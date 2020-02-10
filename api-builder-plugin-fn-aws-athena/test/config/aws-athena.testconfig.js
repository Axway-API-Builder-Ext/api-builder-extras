module.exports = {
	// The configuration settings for your Swagger service.
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-aws-athena': {
			'aws': {
				credentials: {
					region: "us-east-1",
					accessKeyId: "AKIAT5BVQVJFLVYIWNOP",
					secretAccessKey: process.env.AWS_ATHENA_SECRET
				}
			}
		}
	}
};
