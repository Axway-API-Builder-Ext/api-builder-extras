const _ = require('lodash');

/**
 * Fetches the columns from the table based on the specified payload.
 * @param {string} table - table
 * @param {object} payload - payload
 * @returns {array} columns
 */
exports.fetchColumns = function fetchColumns (table, payload) {
	if (this.schema.objects[table]) {
		return _.intersection(Object.keys(payload), Object.keys(this.schema.objects[table]));
	}
	return Object.keys(payload);
};
