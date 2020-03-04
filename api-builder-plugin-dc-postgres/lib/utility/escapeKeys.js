/**
 * Escapes the provided keys for usage in a SQL query.
 * @param {*} keys - keys
 * @returns {*|Array|{}} escaped keys
 */
exports.escapeKeys = function (keys) {
	return keys.map((item) => {
		return `${item}`;
	});
};
