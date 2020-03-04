/**
 * Gets the primary key column for the provided model.
 * @param {object} Model - model to get primary key for
 * @returns {string} the primary key
 */
exports.getPrimaryKeyColumn = function getPrimaryKeyColumn (Model) {
	const pk = Model.getMeta('primarykey');

	if (pk) {
		return pk;
	}
	const name = this.getTableName(Model);
	const tableSchema = this.getTableSchema(Model);
	const primaryKeyColumn = this.metadata.schema.primary_keys[name];
	const column = primaryKeyColumn && tableSchema && tableSchema[primaryKeyColumn];

	return column && column.column_name;
};
