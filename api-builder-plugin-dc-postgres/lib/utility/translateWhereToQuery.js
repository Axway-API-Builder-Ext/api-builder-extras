/**
 * Translates a "where" object in to the relevant portion of a SQL Query.
 * @param {object} Model - The model object
 * @param {object} where - query object
 * @param {array} values - values that get updated with query items
 * @returns {string} sql query
 */
exports.translateWhereToQuery = function (Model, where, values) {
	let forceEmpty = false; // Sometimes we know there'll be no results without having to run
	let whereQuery = [];
	let queryValues = [];

	for (const key in where) {
		if (where.hasOwnProperty(key) && where[key] !== undefined) {
			const safeColumn = this.escapeColumn(Model, key);
			if (!safeColumn) {
				throw new Error(`unknown column in where clause: ${key}`);
			}
			if (where[key].$like) {
				whereQuery.push(`${safeColumn} LIKE $1`);
				queryValues.push(where[key].$like);
			} else if (where[key].$lt) {
				whereQuery.push(`${safeColumn} < $1`);
				queryValues.push(where[key].$lt);
			} else if (where[key].$lte) {
				whereQuery.push(`${safeColumn} <= $1`);
				queryValues.push(where[key].$lte);
			} else if (where[key].$gt) {
				whereQuery.push(`${safeColumn} > $1`);
				queryValues.push(where[key].$gt);
			} else if (where[key].$gte) {
				whereQuery.push(`${safeColumn} >= $1`);
				queryValues.push(where[key].$gte);
			} else if (where[key].$ne) {
				whereQuery.push(`${safeColumn} != $1`);
				queryValues.push(where[key].$ne);
			} else if (where[key].$in) {
				const val = Array.isArray(where[key].$in) ? where[key].$in : [ where[key].$in ];
				if (!val.length) {
					// $in with empty array has to return no results
					queryValues = [];
					whereQuery = [ '0 != 0' ]; // Safety net
					forceEmpty = true;
					break;
				}
				whereQuery.push(`${safeColumn} IN (${val.map(() => '$1').join(',')})`);
				queryValues.push(...val);
			} else if (where[key].$nin) {
				const val = Array.isArray(where[key].$nin) ? where[key].$nin : [ where[key].$nin ];
				if (!val.length) {
					// $nin with empty array has no effect
					continue;
				}
				whereQuery.push(`${safeColumn} NOT IN (${val.map(() => '$1').join(',')})`);
				queryValues.push(...val);
			} else {
				const val = where[key].hasOwnProperty('$eq') ? where[key].$eq : where[key];
				whereQuery.push(`${safeColumn} = $1`);
				queryValues.push(val);
			}
		}
	}

	let sql = '';
	if (whereQuery.length) {
		sql = ` WHERE ${whereQuery.join(' AND ')}`;
		values.push(...queryValues);
	}
	return { forceEmpty, sql };
};
