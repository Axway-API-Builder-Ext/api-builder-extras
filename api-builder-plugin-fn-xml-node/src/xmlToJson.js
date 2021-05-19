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
 *	 https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */
async function xml2json(params, options) {
	const { xmlData, asString, selectPath, removeAllNamespaces, removeNamespaces, ignoreCdata, nativeBooleans } = params;
	const { logger } = options;
	if (!xmlData) {
		throw new Error('Missing required parameter: xmlData');
	}

	const xml2JsonOptions = {
		compact: true,
		trim: true,
		nativeType: false, // Must be false (See: https://github.com/nashwaan/xml-js/issues/53)
		ignoreDeclaration: true,
		ignoreInstruction: true,
		ignoreAttributes: true,
		ignoreComment: true,
		ignoreCdata: ignoreCdata,
		ignoreDoctype: true,
		textFn: handleTextFn
	};
	if(nativeBooleans) {
		xml2JsonOptions.textFn = handleTextFnNativeBoolean;
	}
	if ((removeNamespaces) || (removeAllNamespaces)) {
		xml2JsonOptions.elementNameFn = removeNamespacesFn;
	}

	let result;
	try {
		if (asString) {
			logger.debug('Converting given XML data into a JSON-String.');
			result = convert.xml2json(xmlData, xml2JsonOptions);
		} else {
			logger.debug('Converting given XML data into a JS-Object.');
			result = convert.xml2js(xmlData, xml2JsonOptions);
		}
	} catch (e) {
		logger.error(e.message);
		throw new Error(`Failed to convert XML to JSON. Error: ${e.message}`);
	}
	
	if (typeof result === 'undefined') {
		throw new Error(`Failed to convert XML to JSON. Error: result is undefined`);
	}
	
	if (selectPath) {
		result = jp.value(result, selectPath);
		if (result == undefined) {
			throw new Error(`Nothing found in response message based on path: '${selectPath}'.`);
		}
	}
	
	return result;

	function handleTextFn(value, parentElement) {
		_handleTextFn(value, parentElement);
	}

	function handleTextFnNativeBoolean(value, parentElement) {
		_handleTextFn(value, parentElement, { nativeBoolean: true});
	}

	function _handleTextFn(value, parentElement, options) {
		try {
			if (typeof parentElement._parent === 'undefined') return;
			const pOpKeys = Object.keys(parentElement._parent);
			const keyNo = pOpKeys.length;
			const keyName = pOpKeys[keyNo - 1];
			const arrOfKey = parentElement._parent[keyName];
			const arrOfKeyLen = arrOfKey.length;
			if (arrOfKeyLen > 0) {
				const arr = arrOfKey;
				const arrIndex = arrOfKey.length - 1;
				arr[arrIndex] = value;
			} else {
				parentElement._parent[keyName] = convertValue(value, options);
			}
		} catch (e) {
			logger.error(e);
		}
	};

	function convertValue(value, options) {
		if(!options) return value;
		if(options.nativeBoolean) {
			return convertBoolean(value);
		}
		if(options.nativeNumbers) {
			return convertNumber(value);
		}
	}

	function convertBoolean(value) {
		var bValue = value.toLowerCase();
		if (bValue === 'true') {
			return true;
		} else if (bValue === 'false') {
			return false;
		}
		return value;
	}

	function convertNumber(value) {
		var nValue = Number(value);
		if (!isNaN(nValue)) {
			return nValue;
		}
		var bValue = value.toLowerCase();
		if (bValue === 'true') {
			return true;
		} else if (bValue === 'false') {
			return false;
		}
		return value;
	}

	function removeNamespacesFn(val) {
		if (val.indexOf(":") == -1) {
			return val;
		}

		if (removeAllNamespaces == true) {
			// Don't need to check for ":" because of previous check
			return val.split(":")[1];
		}

		for (var i = 0; i < removeNamespaces.length; ++i) {
			var namespace = removeNamespaces[i];
			if (val.startsWith(`${namespace}:`)) {
				return val.replace(`${namespace}:`, '');
			}
		}

		return val;
	}
}

module.exports = {
	xml2json
};
