/**
 * Gets a connection to the Postgres server.
 * @param {function} cb - callback
 */
exports.getConnection = function getConnection (cb) {
	if (this.pool) {
		this.pool.connect((err, connection) => {
			cb(err, connection);
		});
	} else {
		cb(null, this.connection);
	}
};
