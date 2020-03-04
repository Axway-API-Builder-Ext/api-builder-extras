/**
 * Executes a query against the database.
 * @param {*} query - query
 * @param {object} data - data
 * @param {function} callback - callback
 * @param {function} executor - executor
 * @private
 */
exports._query = function _query (query, data, callback, executor) {
	if (arguments.length < 4) {
		executor = callback;
		callback = data;
		data = null;
	}
	const pool = this.pool;
	const logger = this.logger;

	logger.trace('Postgres QUERY=>', query, data);
	this.getConnection((err, connection) => {
		if (err) {
			return callback(err);
		}
		connection.query(query, data, (err, results) => {
			if (pool) {
				try {
					logger.trace('connection released back to the pool');
					connection.release();
				} catch (e) {
					// ignore error
				}
			}
			if (err) {
				callback(err);
			} else {
				executor(results);
			}
		});
	});
};
