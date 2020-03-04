/**
 * Finds all model instances.  A maximum of 1000 models are returned.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful)
 * 		and the models.
 */
exports.findAll = function (Model, callback) {
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);

	const opts = {
		limit: 1000
	};

	// strictly speaking, ordering by a primary key column shouldn't be
	// necessary as (afaik) most db will automatically order this field
	if (primaryKeyColumn) {
		opts.order = {
			[primaryKeyColumn]: true
		};
	}

	this.query(Model, opts, callback);
};
