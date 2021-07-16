const fs = require('fs');

module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-mongodb': {
			url: process.env.MONGODB_URL, // e.g. mongodb://db-host:27017/order
			collection: process.env.MONGODB_COLLECTION // orderstatus
		}
	}
};
