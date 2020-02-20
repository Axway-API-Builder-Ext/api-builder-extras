const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const { directions } = require('./directions')
const { distance } = require('./distance')
const { elevation } = require('./elevation')
const { geocode } = require('./geocode')

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	debugger;
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), { directions, distance, elevation, geocode });
	const plugin = sdk.getPlugin();
	plugin.flownodes['googleMaps'].methods.directions.action = directions.bind({pluginConfig});
	plugin.flownodes['googleMaps'].methods.distance.action = distance.bind({pluginConfig});
	plugin.flownodes['googleMaps'].methods.elevation.action = elevation.bind({pluginConfig});
	plugin.flownodes['googleMaps'].methods.geocode.action = geocode.bind({pluginConfig});
	return sdk.getPlugin();
}

module.exports = getPlugin;
