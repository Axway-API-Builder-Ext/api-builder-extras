const { Client } = require('@elastic/elasticsearch');

let client = getClient();

function getClient(node) {
	if(node === undefined) {
		node = 'http://api-env:9200';
	}
	let client = new Client({
		node: node,
		maxRetries: 5,
		requestTimeout: 60000
		//sniffOnStart: true
	});
	return client;
}

module.exports = {
	client, getClient
};