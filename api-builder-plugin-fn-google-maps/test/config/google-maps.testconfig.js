module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-google-maps': {
			'google': {
				credentials: {
					apiKey: process.env.GOOGLE_API_KEY
				}
			}
		}
	}
};
