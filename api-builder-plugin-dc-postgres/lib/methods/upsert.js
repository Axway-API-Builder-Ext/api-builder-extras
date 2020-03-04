/**
 * Updates a model or creates the model if it cannot be found.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {String} id ID of the model to update.
 * @param {Object} doc Model attributes to set.
 * @param {Function} callback Callback passed an Error object (or null if successful)
 * 		and the updated or new model.
 */

const _ = require('lodash');

const APIBuilder = require('@axway/api-builder-runtime');



exports.upsert = function upsert (Model, id, doc, callback) {
	if (!id || !doc) {
		throw new Error('You must provide a Model id and data Object, that will be persisted');
	}

	const tableName = this.getTableName(Model);
	const table = this.escapeKeys([ tableName ])[0];
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);
	if (!primaryKeyColumn) {
		return callback(new APIBuilder.ORMError(`Can't find primary key column for ${tableName}`));
	}

	const payload = Model.instance(doc, false).toPayload();
	const columns = this.fetchColumns(tableName, payload);
	let placeholders;
	let query;

	this.findByID(Model, id, (err, result) => {
		const values = _.values(doc);
		const instance = Model.instance(doc, true);
		if (err) {
			callback(err);
		} else if (result) {
			instance.setPrimaryKey(id);
			this.save(Model, instance, () => {
				callback(null, instance);
			});
			/*
			placeholders = this.escapeKeys(columns).map((name) => `${name} = ?`);
			query = `UPDATE ${table} SET ${placeholders.join(',')} WHERE ${primaryKeyColumn} = ?`;
			values.push(id); // last position

			this._query(query, values, callback, () => {
				const instance = Model.instance(doc, true);
				instance.setPrimaryKey(id);
				callback(null, instance);
			});*/
		} else {
			this.create(Model, doc, () => {
				instance.setPrimaryKey(id);
				callback(null, instance);
			});
		}
	});
};
