const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
	const plugin = sdk.getPlugin();
	plugin.flownodes['athena'].methods.query.action = actions.query.bind({ pluginConfig});
	return sdk.getPlugin();
}

module.exports = getPlugin;
