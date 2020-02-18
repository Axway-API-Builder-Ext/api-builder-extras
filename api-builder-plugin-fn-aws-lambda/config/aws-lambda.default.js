module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-aws-lambda': {
			'aws': {
				credentials: {
					region: process.env.AWS_ACCESS_REGION,
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
				}
			}
		}
	}
};
