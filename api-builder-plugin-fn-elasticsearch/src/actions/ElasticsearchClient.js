const { Client } = require('@elastic/elasticsearch');

class ElasticsearchClient {

	constructor(config) {

		if(ElasticsearchClient.instance instanceof ElasticsearchClient) {
			return ElasticsearchClient.instance;
		}

		this.client = new Client(config);
		ElasticsearchClient.instance = this;
	};

	getInstance() {
		return this.client;
	}
}

module.exports = { ElasticsearchClient }