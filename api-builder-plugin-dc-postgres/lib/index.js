/*
 Welcome to the Postgres connector!
 */
const semver = require('semver');

/**
 * Creates the Postgres connector for API Builder.
 * @param {object} APIBuilder - API Builder instance
 * @returns {object} Connector instance
 */
exports.create = function (APIBuilder) {
	if (semver.lt(APIBuilder.Version || '0.0.0', '4.0.0-0')) {
		throw new Error('This connector requires at least version 4.0.0 of API Builder.');
	}
	const Connector = APIBuilder.Connector;
	const Capabilities = Connector.Capabilities;

	return Connector.extend({
		filename: module.filename,
		capabilities: [
			Capabilities.ConnectsToADataSource,
			Capabilities.ValidatesConfiguration,
			// Capabilities.ContainsModels,
			Capabilities.GeneratesModels,
			Capabilities.CanCreate,
			Capabilities.CanRetrieve,
			Capabilities.CanUpdate,
			Capabilities.CanDelete
			// Capabilities.AuthenticatesThroughConnector
		]
	});
};
