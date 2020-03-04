/**
 * Fetches the schema for your connector.
 *
 * For example, your schema could look something like this:
 * {
 *     objects: {
 *         person: {
 *             first_name: {
 *                 type: 'string',
 *                 required: true
 *             },
 *             last_name: {
 *                 type: 'string',
 *                 required: false
 *             },
 *             age: {
 *                 type: 'number',
 *                 required: false
 *             }
 *         }
 *     }
 * }
 *
 * @param {function} next - callback
 * @returns {*}
 */
exports.fetchSchema = function (next) {
	// If we already have the schema, just return it.
	if (this.schema) {
		return next(null, this.schema);
	}

	const query = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = $1';
	debugger;
	this._query(query, [ this.config.schema ], next, (results) => {
		const schema = {
			objects: {},
			database: this.config.database,
			primary_keys: {}
		};
		results.rows.map((result) => {
			let entry = schema.objects[result.table_name];
			if (!entry) {
				schema.objects[result.table_name] = entry = {};
			}
			entry[result.column_name] = result;
			if (result.is_identity === 'YES') {
				schema.primary_keys[result.table_name] = result.column_name;
			}
		});
		next(null, schema);
	});
};
