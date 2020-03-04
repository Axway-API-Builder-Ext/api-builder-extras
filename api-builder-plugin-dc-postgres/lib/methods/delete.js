const APIBuilder = require('@axway/api-builder-runtime');

/**
 * Deletes the model instance.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {APIBuilder.Instance} instance Model instance.
 * @param {Function} callback Callback passed an Error object (or null if successful),
 * 		and the deleted model.
 * @returns {undefined}
 */
exports['delete'] = function (Model, instance, callback) {
	const tableName = this.getTableName(Model);
	const table = this.escapeKeys([ tableName ])[0];
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);
	if (!primaryKeyColumn) {
		return callback(new APIBuilder.ORMError(`Can't find primary key column for ${tableName}`));
	}

	const query = `DELETE FROM ${table} WHERE ${primaryKeyColumn} = $1`;
	this._query(query, new Array(instance.getPrimaryKey()), callback, (result) => {
		if (result && result.affectedRows) {
			callback(null, instance);
		} else {
			callback();
		}
	});
};
