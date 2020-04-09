/**
 * Action method.
 * @param {object} req - The flow request context passed in at runtime.  The
 *	 parameters are resolved as `req.params` and the available authorization
 * credentials are passed in as `req.authorizations`.
 * @param {object} outputs - A set of output callbacks.  Use it to signal an
 *	 event and pass the output result back to the runtime.  Only use an
 *	 output callback once and only after all asyncronous tasks complete.
 * @param {object} options - The additional options provided from the flow
 * 	 engine.
 * @param {object} The logger from API Builder that can be used to log messages
 * 	 to the console. See https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 *
 * @return {undefined}
 */
function distance(req, outputs, options) {
	const origins = req.params.origins;
  const destinations = req.params.destinations;
  const mode = req.params.mode;
  var waypoints = req.params.waypoints;
  const alternatives = req.params.alternatives;
  const avoid = req.params.avoid;
  const language = req.params.language;
  const units = req.params.units;
  const region = req.params.region;
  const arrival_time = req.params.arrival_time;
  const departure_time = req.params.departure_time;
  const traffic_model = req.params.traffic_model;
  const transit_mode = req.params.transit_mode;
  const transit_routing_preference = req.params.transit_routing_preference;
  const optimize = req.params.optimize;

  const apiKey = this.pluginConfig.google.credentials.apiKey;
  const client = this.mapsClient;

	if (!origins) {
		options.logger.error('The origins parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: origins'});
	}
  if (!destinations) {
		options.logger.error('The destinations parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: destinations'});
	}
  if(typeof apiKey === 'undefined')
  {
    options.logger.error('Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
  	return outputs.error(null, {message: 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js'});
  }

  if(typeof waypoints === 'undefined') {
    waypoints = [];
  }

  var distanceParams = {
    key: apiKey,
    origins: origins,
    destinations: destinations,
    mode: mode,
    language: language,
    units: units,
    avoid: avoid,
    traffic_model: traffic_model,
    transit_mode: transit_mode,
    transit_routing_preference: transit_routing_preference
  }

  if(typeof departure_time != 'undefined' && typeof arrival_time != 'undefined') {
    options.logger.error(`You cannot define departure_time and arrival_time at the same time.`);
    return outputs.error(null, {message: 'You cannot define departure_time and arrival_time at the same time.'});
  }

  if(typeof departure_time != 'undefined') {
    distanceParams.departure_time = departure_time;
  }
  if(typeof arrival_time != 'undefined') {
    distanceParams.arrival_time = arrival_time;
  }

  client
    .distancematrix({
      params: distanceParams,
      timeout: 10000 // milliseconds
    })
    .then(response => {
      if(response.data.status != 'OK') {
        options.logger.error(`Error: ` + JSON.stringify(response.data));
        return outputs.error(null, {message: response.data});
      } else {
        return outputs.next(null, response.data);
      }
    })
    .catch(error => {
      options.logger.error('Error: ' + JSON.stringify(error.response.data));
      return outputs.error(null, {message: error.response.data});
    })
}

module.exports = {
	distance
};
