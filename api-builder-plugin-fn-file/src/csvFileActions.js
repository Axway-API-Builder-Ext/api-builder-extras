const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');
const _ = require('lodash');

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
async function readCVSFile(params, options) {
	debugger;
	var { filename } = params;

	const logger = options.logger;

	checkParameter(params);

	// Try to read file as given, perhaps an absolute path has been given
	if (!fs.existsSync(filename)) {
		filename = path.join(process.env.INIT_CWD, filename);
		if (!fs.existsSync(filename)) {
			throw new Error(`File: ${params.filename} not found.`);
		}
	}

	const records = [];
	const csvParseOptions = {
		trim: true, columns: true, on_record: function (record, { lines }) {
			return filterRecord(record, lines, params, options);
		}
	};
	if (params.delimiter) csvParseOptions.delimiter = params.delimiter;
	if (params.comment) csvParseOptions.comment = params.comment;
	if (params.quote) csvParseOptions.quote = params.quote;
	if (params.relax_column_count) csvParseOptions.relax_column_count = params.relax_column_count;
	if (params.columns) csvParseOptions.columns = params.columns;

	try {
		const endEvent = new Promise((resolve, reject) => {
			fs.createReadStream(filename)
				.pipe(parse(csvParseOptions))
				.on('readable', function () {
					let record;
					while (record = this.read()) {
						records.push(record);
					}
				})
				.on('end', function () {
					options.logger.info(`Found ${records.length} in the CSV-File: ${filename}.`);
					if (records.length == 0 || (params.uniqueResult && records.length != 1)) {
						if (params.filterValues) {
							reject(Error(`No entry found in CSV-File: ${filename} using filterValues: ${params.filterValues} using filterColumn: ${params.filterColumn}`));
						} else {
							reject(Error(`No entry found in CSV-File: ${filename}`));
						}
					} else {
						resolve(records);
					}
				})
		});

		result = await endEvent;
		return result;
	} catch (ex) {
		throw new Error(`Unexpected error reading CSV-File: ${filename}`)
	}
}

function filterRecord(record, lines, params, options) {
	const { resultColumns } = params;
	const { filterValues } = params;
	const { filterColumn } = params;

	if (resultColumns) {
		options.logger.debug(`Filtering columns: ${resultColumns}`);
		var filteredRecord = {};
		record = _.pick(record, resultColumns);
	}
	if (filterValues) {
		if (typeof filterValues === 'object') {
			record = filterValues.includes(record[filterColumn]) ? record : null;
		} else {
			record = record[filterColumn] == filterValues ? record : null;
		}
	}
	return record;
}

function checkParameter(params) {
	var { filename } = params;
	const { filterValues } = params;
	const { filterColumn } = params;

	if (!filename) {
		throw new Error('Missing required parameter: filename');
	}
	if (!filterValues && filterColumn) {
		throw new Error('You need to provide a filterValues when using filterColumn');
	}
	if (filterValues && !filterColumn) {
		throw new Error('You need to provide a filterColumn when using filterValues');
	}
	return true;
}

module.exports = {
	readCVSFile
};
