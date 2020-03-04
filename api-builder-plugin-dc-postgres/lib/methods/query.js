const APIBuilder = require('@axway/api-builder-runtime');

/**
 * Queries for particular model records.
 * @param {APIBuilder.Model} Model The model class being updated.
 * @param {ArrowQueryOptions} options Query options.
 * @param {Function} callback Callback passed an Error object (or null if successful)
 * 		and the model records.
 * @throws {Error} Failed to parse query options.
 * @returns {Functon}
 */
exports.query = function (Model, options, callback) {
	let table = this.getTableName(Model);
	table = this.escapeKeys([ table ])[0];
	const primaryKeyColumn = this.getPrimaryKeyColumn(Model);
	const queryKeys = new Set();
	let whereQuery = { sql: '' };
	let pagingQuery = '';
	let orderQuery = '';
	const values = [];
	const sel = Object.keys(Model.translateKeysForPayload(options.sel || {}));
	const unsel = Object.keys(Model.translateKeysForPayload(options.unsel || {}));

	const where = Model.translateKeysForPayload(options.where);
	if (where && Object.keys(where).length > 0) {
		whereQuery = this.translateWhereToQuery(Model, where, values);
	}

	if (whereQuery.forceEmpty) {
		// No need to execute the query as the where is known to return no results.
		return callback(null, []);
	}

	// sel is mutulally exclusive with unsel.  the latter, being akin to '*',
	// minus the supplied fields.
	if (sel.length) {
		if (!options.distinct && primaryKeyColumn) {
			queryKeys.add(this.escapeColumn(Model, primaryKeyColumn));
		}
		for (let i = 0; i < sel.length; ++i) {
			const selField = sel[i];
			const escSel = this.escapeColumn(Model, selField);
			if (escSel === null) {
				callback(new Error(`cannot find column for ${table}`));
				return;
			}
			queryKeys.add(this.escapeColumn(Model, selField));
		}
	} else if (unsel.length) {
		if (!options.distinct && primaryKeyColumn) {
			queryKeys.add(this.escapeColumn(Model, primaryKeyColumn));
		}
		// add all table columns but filter out the unsel ones.
		Object.keys(this.getTableSchema(Model))
			.filter(field => !unsel.includes(field))
			.forEach(unselField => queryKeys.add(this.escapeColumn(Model, unselField)));
	} else {
		queryKeys.add('*');
	}

	if (!queryKeys.size) {
		callback(new Error(`no columns to select for ${table}`));
		return;
	}
	const keys = Array.from(queryKeys).join(', ');

	if (typeof options.order === 'string') {
		options.order = options.order
			.split(',')
			.reduce((res, prop) => {
				res[prop] = 1;
				return res;
			}, {});
	}

	const order = Model.translateKeysForPayload(options.order || {});
	const orderKeys = Object.keys(order);
	for (let i = 0; i < orderKeys.length; ++i) {
		const orderField = orderKeys[i];
		if (i === 0) {
			orderQuery = ' ORDER BY ';
		}
		const safeOrder = this.escapeColumn(Model, orderField);
		if (!safeOrder) {
			callback(new Error(`invalid order column for ${table}`));
			return;
		}
		orderQuery += `${safeOrder} `;
		let orderKey = order[orderField];
		if (typeof orderKey === 'string') {
			orderKey = orderKey.toLowerCase();
		}
		if (orderKey === 1 || orderKey === true || orderKey === '1' || orderKey === 'true') {
			orderQuery += 'ASC';
		} else {
			orderQuery += 'DESC';
		}
		if (i < orderKeys.length - 1) {
			orderQuery += ', ';
		}
	}

	if (options.limit) {
		pagingQuery += ' LIMIT $'+(values.length+1);
		values.push(+options.limit);
	}

	if (options.skip) {
		pagingQuery += ' OFFSET $'+(values.length+1);
		values.push(+options.skip);
	}

	const distinct = options.distinct ? 'DISTINCT ' : '';
	const query = `SELECT ${distinct}${keys} FROM ${table}${whereQuery.sql}${orderQuery}${pagingQuery}`;
	this._query(query, values, callback, (results) => {
		if (results) {
			callback(null, new APIBuilder.Collection(Model, results.rows.map((row) => {
				return this.getInstanceFromRow(Model, row);
			})));
		} else {
			// FIXME (RDPP-1265) (return collection)
			callback(null, []);
		}
	});
};
