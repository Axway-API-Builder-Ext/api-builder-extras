/**
 * Returns the appropriate MySQL placeholder for variadic arguments.
 * @returns {string} a question mark
 */
exports.returnPlaceholder = function (name, index) {
	return `\$${index+1}`;
};
