const { isDeveloperMode } = require('./utils');
/**
 * Action method.
 *
 * @param {object} params - A map of all the parameters passed from the flow.
 * @param {object} options - The additional options provided from the flow
 *	 engine.
 * @param {object} options.pluginConfig - The service configuration for this
 *	 plugin from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {object} options.logger - The API Builder logger which can be used
 *	 to log messages to the console. When run in unit-tests, the messages are
 *	 not logged.  If you wish to test logging, you will need to create a
 *	 mocked logger (e.g. using `simple-mock`) and override in
 *	 `MockRuntime.loadPlugin`.  For more information about the logger, see:
 *	 https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/project/logging/index.html
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */
async function shutdown(params, options) {
	let { errorCode, errorMessage, skipInDevelopment } = params;
	const { logger } = options;
	if (!errorCode) {
		errorCode = -1;
	}
	logger.error(`${errorMessage} (Error-Code: ${errorCode})`);
	if(skipInDevelopment && isDeveloperMode()) {
		logger.warn(`API-Builder is in development mode. Skip shutdown.`);
		return `${errorMessage} (Error-Code: ${errorCode})`;
	} else {
		process.exit(errorCode)
	}
}

  /**
   * Tests whether or not the API Builder application is in developer mode.  The test
   * is to check to see if @axway/api-builder-admin exists.
   *
   * @returns {boolean} True if in developer mode.
   */
   isDeveloperMode: () => {
    try {
      // If we are in "development mode" we are going to have @axway/api-builder-admin
      // dependency installed. So we guarantee that only generate config files in
      // "development mode" and ensure immutable production environments.
      // eslint-disable-next-line import/no-unresolved
      require('@axway/api-builder-admin');
      return true;
    } catch (ex) {
      // when we run plugin test suite @axway/api-builder-admin is not there 
      // so we are kind of simulating production mode
      return false;
    }
  }

module.exports = {
	shutdown
};
