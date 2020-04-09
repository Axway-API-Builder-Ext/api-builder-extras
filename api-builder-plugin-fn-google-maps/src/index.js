const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const { directions } = require('./directions')
const { distance } = require('./distance')
const { elevation } = require('./elevation')
const { geocode } = require('./geocode')
const { reverseGeocode } = require('./reverseGeocode')
const { findPlaceFromText } = require('./places/findPlaceFromText')
const { textSearch } = require('./places/textSearch')
const { placeDetails } = require('./places/placeDetails')
const { placesNearby } = require('./places/placesNearby')

const maps = new require("@googlemaps/google-maps-services-js");


/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'google-maps.yml'), { directions, distance, elevation, geocode, reverseGeocode });
	sdk.load(path.resolve(__dirname, 'google-maps-places.yml'), { findPlaceFromText, textSearch, placeDetails, placesNearby });
	const plugin = sdk.getPlugin();
	const mapsClient = getGoogleMapsClient(pluginConfig);
	plugin.flownodes['googleMaps'].mapsClient = mapsClient;
	plugin.flownodes['googleMapsPlaces'].mapsClient = mapsClient;

	plugin.flownodes['googleMaps'].methods.directions.action = directions.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMaps'].methods.distance.action = distance.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMaps'].methods.elevation.action = elevation.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMaps'].methods.geocode.action = geocode.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMaps'].methods.reverseGeocode.action = reverseGeocode.bind({mapsClient, pluginConfig});

	plugin.flownodes['googleMapsPlaces'].methods.findPlaceFromText.action = findPlaceFromText.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMapsPlaces'].methods.textSearch.action = textSearch.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMapsPlaces'].methods.placeDetails.action = placeDetails.bind({mapsClient, pluginConfig});
	plugin.flownodes['googleMapsPlaces'].methods.placesNearby.action = placesNearby.bind({mapsClient, pluginConfig});

	return sdk.getPlugin();
}

function getGoogleMapsClient(pluginConfig) {
	const mapsClient = new maps.Client({});
	return mapsClient;
}

module.exports = getPlugin;
