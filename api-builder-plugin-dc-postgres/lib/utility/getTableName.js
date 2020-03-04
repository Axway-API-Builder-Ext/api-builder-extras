/**
 * Gets the table name from the provided model.
 * @param {object} Model - model to use
 * @returns {string}
 */
exports.getTableName = function getTableName (Model) {
	let parent = Model;
	while (parent._parent && parent._parent.name) {
		parent = parent._parent;
	}
	let table = Model.getMeta('table') || parent.name || Model._supermodel || Model.name;
	table = table.split('/').pop();
	return table;
};
