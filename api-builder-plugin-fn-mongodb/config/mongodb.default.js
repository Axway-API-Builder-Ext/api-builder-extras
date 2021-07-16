const fs = require('fs');

module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-mongodb': {
			url: process.env.MONGODB_URL, // e.g. mongodb://db-host:27017/order
			collection: process.env.MONGODB_COLLECTION, // orderstatus
			// Add all MongoClientOptions as described here: 
			// https://mongodb.github.io/node-mongodb-native/4.0/interfaces/mongoclientoptions.html
			mongoClientOptions: {
				auth: {
					username: process.env.MONGODB_USERNAME,
					password: process.env.MONGODB_PASSWORD
				},
				appName: process.env.MONGODB_APPNAME || 'API-Builder',
			}
		}
	}
};
