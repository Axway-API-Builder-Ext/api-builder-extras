
const APIBuilder = require('@axway/api-builder-runtime');

/**
 * Finds a model instance using the primary key.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {string} id ID of the model to find.
 * @param {Function} callback Callback passed an Error object (or null if successful)
 * 		and the found model.
 * @returns {undefined}
 */
exports.findByID = function (Model, id, callback) {
	const tableName = this.getTableName(Model);
	const table = this.escapeKeys([ tableName ])[0];
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);
	if (!primaryKeyColumn) {
		return callback(new APIBuilder.ORMError(`Can't find primary key column for ${tableName}`));
	}

	const query = `SELECT ${primaryKeyColumn}, ${this.escapeKeys(Model.payloadKeys()).join(', ')}  FROM ${table} WHERE ${primaryKeyColumn} = $1 LIMIT 1`;

	this._query(query, new Array(id.toString()), callback, (result) => {
		if (result && result.rows.length) {
			callback(null, this.getInstanceFromRow(Model, result.rows[0]));
		} else {
			callback(`No entity found in table: ${table} using keyColumn: ${primaryKeyColumn} with id: ${id}`);
		}
	});
};
