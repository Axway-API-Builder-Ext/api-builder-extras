const simple = require('simple-mock');
const fs = require('fs');
const { debug } = require('console');

function setupElasticsearchMock(client, methodName, responeFilename, shouldError) {
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

module.exports = {
    setupElasticsearchMock
}