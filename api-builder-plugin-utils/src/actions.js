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
 *	 https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */
async function switchCase(params, options) {
	var { source, value1, value2, value3, value4, value5, notMatchDefault } = params;
	const { logger } = options;
	if (!source) {
		throw new Error('Missing required parameter: source');
	}
	if (!value1) {
		throw new Error('Missing required parameter: value1');
	}
	value1 = value1.trim();
	if(value2) value2 = value2.trim();
	if(value3) value3 = value3.trim();
	if(value4) value4 = value4.trim();
	if(value5) value5 = value5.trim();
	source = source.trim();
	switch (source) {
		case value1:
			return options.setOutput(1, source);
		case value2:
			return options.setOutput(2, source);
		case value3:
			return options.setOutput(3, source);
		case value4:
			return options.setOutput(4, source);
		case value5:
			return options.setOutput(5, source);
		default:
			if(notMatchDefault) return options.setOutput('default', source);
			break;
	}
	throw new Error(`No match for source: ${source} on given values.`);
}

async function traceMessage(params, options) {
	var { message, level } = params;
	const { logger } = options;
	debugger;
	if (!message) {
		logger.error("Message to trace is missing");
		return "Message to trace is missing";
	}
	if (!level) {
		logger.error("Message Trace-Level is missing");
		return "Message Trace-Level is missing";
	}
	switch(level) {
		case "info": 
			logger.info(message);
			break;
		case "warn": 
			logger.warn(message);
			break;
		case "debug": 
			logger.debug(message);
			break;
		case "error": 
			logger.error(message);
			break;
		default:
			logger.error(`Log-Level: ${level} is unknown. ${message}`);
			return `Log-Level: ${level} is unknown. ${message}`;
	}
	return message;
}

module.exports = {
	switchCase, 
	traceMessage
};
