/*
 * Use this file to configure your Postgres data connector
 *
 * By default, Postgres host, username, password and port are environment variables.
 * You may configure them in conf/.env file during development phase.
 * Example setting of environment variables manually:
 * linux/mac: export POSTGRES_PASSWORD=password
 * windows: setx POSTGRES_PASSWORD 'password'
 */
module.exports = {
	connectors: {
		postgres: {
			connector: '@axway/api-builder-plugin-dc-postgres',
			connectionPooling: true,
			connectionLimit: 10,
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT,
			database: process.env.POSTGRES_DB,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			schema: 'public',

			// Create models based on your schema that can be used in your API.
			generateModelsFromSchema: true,

			// Whether or not to generate APIs based on the methods in generated models.
			modelAutogen: false
		}
	}
};
