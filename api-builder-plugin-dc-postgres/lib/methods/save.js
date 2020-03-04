
const APIBuilder = require('@axway/api-builder-runtime');
const _ = require('lodash');

/**
 * Updates a Model instance.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {APIBuilder.Instance} instance Model instance to update.
 * @param {Function} callback Callback passed an Error object (or null if successful)
 * 		and the updated model.
 * @returns {undefined}
 */
exports.save = function (Model, instance, callback) {
	const tableName = this.getTableName(Model);
	const table = this.escapeKeys([ tableName ])[0];
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);
	if (!primaryKeyColumn) {
		return callback(new APIBuilder.ORMError(`Can't find primary key column for ${tableName}`));
	}

	const payload = instance.toPayload();
	const columns = this.escapeKeys(this.fetchColumns(tableName, payload));
	const placeholders = columns.map((name, index) => {
		
		return `${name} = \$${index+1}`;
	});
	const values = _.values(payload).concat([ instance.getPrimaryKey() ]);
	const query = `UPDATE ${table} SET ${placeholders.join(',')} WHERE ${primaryKeyColumn} = \$${values.length}`;

	this._query(query, values, callback, (result) => {
		if (result && result.affectedRows) {
			callback(null, instance);
		} else {
			callback();
		}
	});
};
