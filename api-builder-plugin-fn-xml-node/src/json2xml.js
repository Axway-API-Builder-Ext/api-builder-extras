const convert = require('xml-js');
var jp = require('jsonpath');
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
async function json2xml(params, options) {
	const { jsonData, spaces, compact, fullTagEmptyElement, indentCdata, indentAttributes, ignoreDeclaration, ignoreInstruction, ignoreAttributes, ignoreComment, ignoreCdata, ignoreDoctype, ignoreText } = params;
	const { logger } = options;
	if (!jsonData) {
		throw new Error('Missing required parameter: jsonData');
	}
	debugger;

	const json2xmlOptions = {
		spaces: spaces ? spaces : 0,
		compact: compact ? compact : true,
		fullTagEmptyElement: fullTagEmptyElement ? fullTagEmptyElement : false,
		indentCdata: indentCdata ? indentCdata : false,
		indentAttributes: indentAttributes ? indentAttributes : false,
		ignoreDeclaration: ignoreDeclaration ? ignoreDeclaration : false,
		ignoreInstruction: ignoreInstruction ? ignoreInstruction : false,
		ignoreAttributes: ignoreAttributes ? ignoreAttributes : false,
		ignoreComment: ignoreComment ? ignoreComment : false,
		ignoreDoctype: ignoreDoctype ? ignoreDoctype : false,
		ignoreCdata: ignoreCdata ? ignoreCdata : false,
		ignoreDoctype: ignoreDoctype ? ignoreDoctype : false,
		ignoreText: ignoreText ? ignoreText : false,
	};

	let result;
	try {
		if(jsonData instanceof Object) {
			logger.debug('Converting given JSON Object into XML.');
			result = convert.js2xml(jsonData, json2xmlOptions);
		} else {
			logger.debug('Converting given JSON String into XML.');
			result = convert.json2xml(jsonData, json2xmlOptions);
		}
	} catch (e) {
		logger.error(e.message);
		throw new Error(`Failed to convert JSON into XML. Error: ${e.message}`);
	}
	
	if (typeof result === 'undefined' || result == "") {
		throw new Error(`Failed to convert JSON into XML. Error: result is: ${result}`);
	}
	
	return result;
}

module.exports = {
	json2xml
};
