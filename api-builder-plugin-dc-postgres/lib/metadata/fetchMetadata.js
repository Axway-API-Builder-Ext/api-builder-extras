const APIBuilder = require('@axway/api-builder-runtime');

/**
 * Fetches metadata describing your connector's proper configuration.
 * @param {function} next - callback
 */
exports.fetchMetadata = function fetchMetadata (next) {
	next(null, {
		fields: [
			APIBuilder.Metadata.Checkbox({
				name: 'connectionPooling',
				description: 'Whether or not to use connection pooling',
				required: false
			}),
			APIBuilder.Metadata.NumField({
				name: 'connectionLimit',
				description: 'If using connectionPooling, the number of connections to allow',
				required: false
			}),
			APIBuilder.Metadata.Text({
				name: 'host',
				description: 'The host name of your database',
				required: true
			}),
			APIBuilder.Metadata.NumField({
				name: 'port',
				description: 'The port your database is running on',
				default: 3306,
				required: false
			}),
			APIBuilder.Metadata.Text({
				name: 'database',
				description: 'The name of your database',
				default: 'test',
				required: true
			}),
			APIBuilder.Metadata.Text({
				name: 'user',
				description: 'The username for connecting to your database',
				required: true
			}),
			APIBuilder.Metadata.Text({
				name: 'password',
				description: 'The password for connecting to your database',
				required: false
			}),
			APIBuilder.Metadata.Checkbox({
				name: 'generateModelsFromSchema',
				description: 'Whether or not to generate models from your schema',
				required: false
			}),
			APIBuilder.Metadata.Checkbox({
				name: 'modelAutogen',
				description: 'Whether or not generated models should create their own APIs',
				required: false
			})
		]
	});
};
