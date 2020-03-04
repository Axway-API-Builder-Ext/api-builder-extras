/**
 * Converts SQL data types to their appropriate JavaScript type.
 * @param {string} dataType - sql data type
 * @returns {Type} js data type
 */
exports.convertDataTypeToJSType = function convertDataTypeToJSType (dataType) {
	switch (dataType) {
		// Integer Types (Exact Value)
		case 'integer':
		case 'int':
		case 'smallint':
		case 'tinyint':
		case 'mediumint':
		case 'bigint':

		// Fixed-Point Types (Exact Value)
		case 'decimal':
		case 'numeric':

		// Floating-Point Types (Approximate Value)
		case 'float':
		case 'real':
		case 'double':

		// Bit-Value Type - BIT
		case 'bit':

		// Date and Time Types
		case 'year':

		// This one should be considered for revision
		case 'binary':
			return Number;
		case 'date':
		case 'datetime':
		case 'time':
			return Date;
		default:
			return String;
	}
};
