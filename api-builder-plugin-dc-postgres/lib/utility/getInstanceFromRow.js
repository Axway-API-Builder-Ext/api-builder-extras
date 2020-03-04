/**
 * Creates a model instance based on the provided row data.
 * @param {object} Model - model to use
 * @param {*} row - row
 * @returns {object} model instance
 */
exports.getInstanceFromRow = function (Model, row) {
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);
	const instance = Model.instance(row, true);

	if (primaryKeyColumn) {
		instance.setPrimaryKey(row[primaryKeyColumn]);
	}
	return instance;
};
