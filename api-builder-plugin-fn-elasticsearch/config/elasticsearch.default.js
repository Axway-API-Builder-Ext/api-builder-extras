const fs = require('fs');

module.exports = {
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch': {
			'elastic': {
				nodes: (process.env.ELASTICSEARCH_HOSTS) ? process.env.ELASTICSEARCH_HOSTS.split(',') : "http://your.elasticsearch.host:9200",
				auth: {
					// Use an API-Key
					apiKey: process.env.ELASTIC_API_KEY,
					// or username / password based
					username: process.env.ELASTIC_USERNAME,
					password: process.env.ELASTIC_PASSWORD
				},
				// The name to identify the client instance in the events.
				name: 'api-builder',
				// You can use all configuration options documented here: 
				// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/client-configuration.html
				maxRetries: 5,
				requestTimeout: 60000,
				//ssl: {
				//	ca: fs.readFileSync('./cacert.pem'),
				//	rejectUnauthorized: false
				//}
			},
			// The connection to Elasticsearch is validated on API-Builder startup by default
			// It can be disabled by setting this to false.
			validateConnection: ("false" == process.env.VALIDATE_ELASTIC_CONNECTION) ? false : true
		}
	}
};
