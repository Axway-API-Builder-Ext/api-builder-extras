/**
 * Disconnects from your data store.
 * @param {function} next - callback
 */
exports.disconnect = function (next) {
	const toEnd = this.pool || this.connection;

	if (toEnd) {
		toEnd.end(() => {
			this.pool = this.connection = null;
			next();
		});
	} else {
		next();
	}
};
