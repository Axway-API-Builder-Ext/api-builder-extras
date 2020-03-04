const { Pool } = require('pg');

/**
 * Connects to your data store; this connection can later be used by your connector's methods.
 * @param {function} next - callback
 */
exports.connect = function (next) {
	if (this.config.connection_pooling || this.config.connectionPooling) {
		this.pool = new Pool(this.config); //pg.createPool(this.config);
		this.pool.connect((err, connection) => {
			if (err) {
				if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
					err.message = 'Connecting to your Postgres server failed; either it isn\'t running, or your connection details are invalid.';
				}
				next(err);
			} else {
				// We successfully verified that the pool is working;
				// release the connection for future use.
				connection.release();
				next();
			}
		});
	} else {
		this.connection = pg.createConnection(this.config);
		this.connection.connect(next);
	}
};
