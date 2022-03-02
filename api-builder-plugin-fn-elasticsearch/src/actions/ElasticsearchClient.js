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
        var response;
        if(responeFilename) {
            response = JSON.parse(fs.readFileSync(responeFilename), null);
        } else {
            response = {dummy:"response"};
        }
        if(callback != undefined) {
            if(shouldError) {
                // Return the given response as an error
                callback(response, null);
            } else {
                // Otherwise return the response as expected
                callback(null, response);
            }
        } else {
            return new Promise((resolve, reject) => {
                if(shouldError) {
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        }
    });

    let [namespace, method] = methodName.split('.');
    if (method == null) {
        method = namespace;
        namespace = null;
    }
    if (namespace != null) {
        client[namespace][method] = mockedFn
    } else {
        client[method] = mockedFn;
    }
    // Return the mocked function to perform assertions
    return mockedFn;
}

module.exports = { ElasticsearchClient, mockElasticsearchMethod }