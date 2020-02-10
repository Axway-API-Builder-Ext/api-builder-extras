const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin() {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
	return sdk.getPlugin();
}

module.exports = getPlugin;
