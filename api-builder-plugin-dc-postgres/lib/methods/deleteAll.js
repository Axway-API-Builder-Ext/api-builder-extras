/**
 * Deletes all the data records.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful),
 * 		and the deleted models.
 */
exports.deleteAll = function (Model, callback) {
	let table = this.getTableName(Model);
	table = this.escapeKeys([ table ])[0];
	const query = `DELETE FROM ${table}`;

	this._query(query, callback, (result) => {
		callback(null, result && (result.affectedRows || 0));
	});
};
