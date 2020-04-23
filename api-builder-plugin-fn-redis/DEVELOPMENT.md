# Development

This file contains information related with this plugin development

## Tests

How to run the test suite after checking out this plugin?

### Unit test suite

Run the unit test suite with the following command:

> `npm test`

The unit test suite is mocking a Redis instance to execute tests and validate parameters and responses are handled correclty. These tests are also automatically executed on every commit to this project.

### Integration test suite

Integration test suite is running against a real Redis server. How to run it:

* Make sure you have a running Redis instance (running via Docker might be ok https://hub.docker.com/_/redis/)
  * Start with Docker: `docker run --name some-redis -d redis`
* Create `.env` file in your `test` directory and set values for the environment variables specified in test/config.js. Note that those variables are sensitive and `.env` is added to `.gitignore`. Do not change that.
* Run the test suite with `npm run test:integration`
