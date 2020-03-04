/**
 * Searches for distinct rows in the database.
 * @param {object} Model - model to use
 * @param {string} field - field
 * @param {object} options - options
 * @param {Function} callback - Callback passed an Error object (or null if successful),
 *		and distinct values.
 */
exports.distinct = function distinct (Model, field, options, callback) {
	const opts = {
		limit: 1000,
		...options,
		distinct: true // internal option
	};

	// delete unsupported options (sel is unsupported too)
	delete opts.unsel;

	// set the explicit distinct field
	opts.sel = {
		[field]: true
	};

	this.query(Model, opts, callback);
};
