const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const { directions } = require('./directions')
const { distance } = require('./distance')
const { elevation } = require('./elevation')
const { geocode } = require('./geocode')
const { findPlaceFromText } = require('./places/findPlaceFromText')
const { textSearch } = require('./places/textSearch')
const { placeDetails } = require('./places/placeDetails')
const { placesNearby } = require('./places/placesNearby')


/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	debugger;
	sdk.load(path.resolve(__dirname, 'google-maps.yml'), { directions, distance, elevation, geocode });
	sdk.load(path.resolve(__dirname, 'google-maps-places.yml'), { findPlaceFromText, textSearch, placeDetails, placesNearby });
	const plugin = sdk.getPlugin();
	plugin.flownodes['googleMaps'].methods.directions.action = directions.bind({pluginConfig});
	plugin.flownodes['googleMaps'].methods.distance.action = distance.bind({pluginConfig});
	plugin.flownodes['googleMaps'].methods.elevation.action = elevation.bind({pluginConfig});
	plugin.flownodes['googleMaps'].methods.geocode.action = geocode.bind({pluginConfig});

	plugin.flownodes['googleMapsPlaces'].methods.findPlaceFromText.action = findPlaceFromText.bind({pluginConfig});
	plugin.flownodes['googleMapsPlaces'].methods.textSearch.action = textSearch.bind({pluginConfig});
	plugin.flownodes['googleMapsPlaces'].methods.placeDetails.action = placeDetails.bind({pluginConfig});
	plugin.flownodes['googleMapsPlaces'].methods.placesNearby.action = placesNearby.bind({pluginConfig});

	return sdk.getPlugin();
}

module.exports = getPlugin;
