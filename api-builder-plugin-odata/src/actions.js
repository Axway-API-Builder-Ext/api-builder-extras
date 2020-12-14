const buildQuery = require("odata-query").default;

var logger;
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
async function createQuery(params, options) {
	var { data, filter, search, select, orderBy, expand, singleItem, top, skip, count, url } = params;
	logger = options.logger;
	if (!data) {
		throw new Error('Missing required parameter: data');
	}
	filter = await interpolate(filter, data);
	search = await interpolate(search, data);
	select = await interpolate(select, data);
	orderBy = await interpolate(orderBy, data);
	expand = await interpolate(expand, data);
	singleItem = await interpolate(singleItem, data);
	top = await interpolate(top, data);
	skip = await interpolate(skip, data);
	if(singleItem) skip = parseInt(singleItem);
	if(top) top = parseInt(top);
	if(skip) skip = parseInt(skip);

	if(count) {
		if(count == "IncludeCount") { // Count should be included in the result set (e.g. ?$count=true&$filter=PropName eq 1)
			count = true;
		} else if(count == "ReturnCount") { // Just the count should be returned (e.g /$count?$filter=PropName eq 1)
			count = filter;
		} else {
			throw new Error(`Unsupport count: ${count}`);
		}
	}
	const odataQuery = buildQuery({ filter, search, select, orderBy, expand, singleItem, top, skip, count });
	logger.info(`OData query: ${odataQuery}`);
	if(url) {
		logger.debug(`Return URL plus OData-Query: ${url}`);
		return `${url}${odataQuery}`;
	} else {
		return odataQuery;
	}
}

async function interpolate(string, data) {
	if(string) {
		string = JSON.stringify(string);
	} else {
		return;
	}
	debugger;
	logger.debug(`Got string: ${string}`);
	var result = string.replace(/\${([^}]+)}/g, (_, target) => {
		let keys = target.split(".");
		return keys.reduce((prev, curr) => {
			if (curr.search(/\[/g) > -1) {
				//if element/key in target array is array, get the value and return
				let m_curr = curr.replace(/\]/g, "");
				let arr = m_curr.split("[");
				return arr.reduce((pr, cu) => {
					if(pr[cu] == undefined) {
						throw new Error(`Missing data for selector: \$\{${curr}\}`);
					}
					return pr && pr[cu];
				}, prev);
			} else {
				//else it is a object, get the value and return
				if(prev[curr] == undefined) {
					throw new Error(`Missing data for selector: \$\{${curr}\}`);
				}
				return prev && prev[curr];
			}
		}, data);
	});
	return JSON.parse(result);
};

module.exports = {
	createQuery
};
