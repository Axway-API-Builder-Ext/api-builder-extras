/**
 * Fetches the correct table schema for the model, based on its name.
 * @param {object} Model - model to use
 * @returns {*}
 */
exports.getTableSchema = function getTableSchema (Model) {
	const name = this.getTableName(Model);
	return this.schema.objects[name];
};
