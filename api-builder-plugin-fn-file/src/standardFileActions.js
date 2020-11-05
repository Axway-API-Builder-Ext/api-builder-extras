const fs = require('fs').promises;
const util = require('util');
const path = require('path');

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
 * @example
 * 	Log errors with logger.error('Your error message');
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */
async function writeFile(params, options) {
	var { filename, data, stringify, overwrite } = params;
	const logger = options.logger;

	let dataEncoding = 'utf8';
	let flag = 'wx';

	if (!filename) {
		throw new Error('Missing required parameter: filename');
	}
	if (!data) {
		throw new Error('Missing required parameter: data');
	}

	if(params.dataEncoding) {
		dataEncoding = params.dataEncoding;
	}
	if(typeof(stringify) == "undefined") {
		stringify = true;
	}
	if(params.overwrite) {
		flag = 'w';
	}

	if(data instanceof Object && stringify) {
		data = JSON.stringify(data);
	}
	try {
		await fs.writeFile(filename, data, {encoding: dataEncoding, flag: flag});
	} catch(ex) {
		throw new Error(`Error writing file: ${filename}. Message: ${ex.message}`, ex)
	};
	return filename;
}

async function readFile(params, options) {
	var { filename, encoding, parseJson } = params;
	const { logger } = options;
	if (!filename) {
		throw new Error('Missing required parameter: filename');
	}
	if(!encoding) {
		encoding = "utf8";
	}
	try {
		var content = await fs.readFile(filename, {encoding: encoding});
	} catch(ex) {
		throw new Error(`Error reading file: ${filename}. ${ex}`);
	} 
	if(parseJson) {
		content = JSON.parse(content);
	}
	
	return content;
}

module.exports = {
	writeFile, 
	readFile
};
