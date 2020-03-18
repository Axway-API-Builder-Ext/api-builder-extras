const { Client } = require('@elastic/elasticsearch');

class ElasticsearchClient {

	constructor(node) {

		if(ElasticsearchClient.instance instanceof ElasticsearchClient) {
			return ElasticsearchClient.instance;
		}

		this.client = new Client({
			node: node,
			maxRetries: 5,
			requestTimeout: 60000
			//sniffOnStart: true
		});
		ElasticsearchClient.instance = this;
	};


	getInstance() {
		return this.client;
	}
}

module.exports = { ElasticsearchClient }