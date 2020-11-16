const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const { exclude, include } = require('./actions');

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK({ pluginConfig });
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), { exclude, include });
	return sdk.getPlugin();
}

module.exports = getPlugin;
