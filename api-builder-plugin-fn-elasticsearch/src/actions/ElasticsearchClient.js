const { Client } = require('@elastic/elasticsearch');
const simple = require('simple-mock');
const fs = require('fs');

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

function mockElasticsearchMethod(client, methodName, responeFilename, shouldError) {
    var mockedFn = simple.spy(function (params, options, callback) {
        const resonse = JSON.parse(fs.readFileSync(responeFilename), null);
        if(callback != undefined) {
            if(shouldError) {
                // Return the given response as an error
                callback(resonse, null);
            } else {
                // Otherwise return the response as expected
                callback(null, resonse);
            }
        } else {
            return new Promise((resolve, reject) => {
                if(shouldError) {
                    reject(resonse);
                } else {
                    resolve(resonse);
                }
            });
        }
    });
    // Use the extend functionality of the ES-Client to register the mocked method
    client.extend(methodName, { force: true }, ({ makeRequest }) => {
        return mockedFn;
    });
    // Return the mocked function to perform assertions
    return mockedFn;
}

module.exports = { ElasticsearchClient, mockElasticsearchMethod }