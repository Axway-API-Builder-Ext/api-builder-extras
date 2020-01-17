const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');
const _ = require('lodash');

/**
 * Action method.
 * @param {object} req - The flow request context passed in at runtime.  The
 *	 parameters are resolved as `req.params` and the available authorization
 * credentials are passed in as `req.authorizations`.
 * @param {object} outputs - A set of output callbacks.  Use it to signal an
 *	 event and pass the output result back to the runtime.  Only use an
 *	 output callback once and only after all asyncronous tasks complete.
 * @return {undefined}
 */
function readCVSFile(req, outputs, options) {
	var filename = req.params.filename;

  const logger = options.logger;

	if(!checkParameter(req, outputs)) {
		return outputs;
	}

  // Try to read file as given, perhaps an absolute path has been given
  if(!fs.existsSync(filename)) {
    filename = path.join(process.env.INIT_CWD, filename);
    if(!fs.existsSync(filename)) {
      return outputs.error(null, new Error(`File: ${req.params.filename} not found.`));
    }
  }

	const records = [];
	const csvParseOptions = {trim:true, columns: true, on_record: function(record, {lines})
		{
			return filterRecord(record, lines, req, options);
		}
	};
	if(req.params.delimiter) csvParseOptions.delimiter = req.params.delimiter;
	if(req.params.comment) csvParseOptions.comment = req.params.comment;
	if(req.params.quote) csvParseOptions.quote = req.params.quote;
	if(req.params.relax_column_count) csvParseOptions.relax_column_count = req.params.relax_column_count;
	if(req.params.columns) csvParseOptions.columns = req.params.columns;



	fs.createReadStream(filename)
		.pipe(parse(csvParseOptions))
		.on('readable', function(){
			let record;
			while (record = this.read()) {
				records.push(record);
			}
		})
		.on('end', function() {
			console.log('Found ' + records.length + " in the CSV-File.");
			return outputs.next(null, records);
		});
}

function filterRecord(record, lines, req, options) {
	const resultColumns = req.params.resultColumns;
	const filterValues = req.params.filterValues;
  const filterColumn = req.params.filterColumn;

	if(resultColumns) {
		options.logger.debug(`Filtering columns: ${resultColumns}`);
		var filteredRecord = {};
		record = _.pick(record, resultColumns);
	}
	if(filterValues) {
		if(typeof filterValues === 'object') {
			record = filterValues.includes(record[filterColumn]) ? record : null;
		} else {
			record = record[filterColumn] == filterValues ? record : null;
		}
	}
	return record;
}

function checkParameter(req, outputs) {
	var filename = req.params.filename;
  const filterValues = req.params.filterValues;
  const filterColumn = req.params.filterColumn;

	if (!filename) {
		outputs.error(null, new Error('Missing required parameter: filename'));
		return false;
	}
  if(!filterValues && filterColumn) {
    outputs.error(null, new Error('You need to provide a filterValues when using filterColumn'));
		return false;
  }
  if(filterValues && !filterColumn) {
    outputs.error(null, new Error('You need to provide a filterColumn when using filterValues'));
		return false;
  }
	return true;
}

module.exports = {
	readCVSFile
};
