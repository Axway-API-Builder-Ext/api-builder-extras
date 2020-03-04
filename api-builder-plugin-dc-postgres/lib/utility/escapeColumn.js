/**
 * Escapes the provided column name for usage in a SQL query, esuring that
 * the field corresponds to a column in the table, or returns `null` if
 * not found.
 * @param {object} Model - Model to use
 * @param {object} column - The column name to escape.
 * @returns {string} The escaped column name
 */
exports.escapeColumn = function (Model, column) {
	const schema = this.getTableSchema(Model);
	// I don't like it but the unit tests were all written to sometimes not
	// have a schema, so have to test for it here.
	if (schema) {
		const lcColumn = column.toLowerCase();
		const found = Object.keys(schema).find(k => k.toLowerCase() === lcColumn);
		if (!found) {
			return null;
		}
		return `${found}`;
	}
	return `${column}`;
};
