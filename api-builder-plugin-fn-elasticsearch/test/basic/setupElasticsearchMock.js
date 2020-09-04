const simple = require('simple-mock');
const fs = require('fs');

function setupElasticsearchMock(client, fn, responeFilename, shouldError) {
    simple.mock(client, 'isMocked', true);
    if(!shouldError) {
        const mockedFn = simple.mock(client, fn).callbackWith(null, 
            JSON.parse(fs.readFileSync(responeFilename)));
        return mockedFn;
    } else {
        const mockedFn = simple.mock(client, fn).callbackWith(
            JSON.parse(fs.readFileSync(responeFilename)), 
        null);
        return mockedFn;
    }
}

module.exports = {
    setupElasticsearchMock
}