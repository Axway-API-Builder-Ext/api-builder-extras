const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const directions = require('./directions');
const distance = require('./distance');

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), directions);
	const plugin = sdk.getPlugin();
	plugin.flownodes['googleMaps'].methods.directions.action = actions.directions.bind({pluginConfig});

	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), distance);
	plugin.flownodes['googleMaps'].methods.distance.action = actions.distance.bind({pluginConfig});
	return sdk.getPlugin();
}

module.exports = getPlugin;
