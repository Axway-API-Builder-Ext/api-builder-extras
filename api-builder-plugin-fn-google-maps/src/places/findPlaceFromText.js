const maps = new require("@googlemaps/google-maps-services-js");

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
function findPlaceFromText(req, outputs, options) {
	const locations = req.params.locations;

  const apiKey = this.pluginConfig.google.credentials.apiKey;

	if (!locations) {
		options.logger.error('The locations parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: locations'});
	}
  if(typeof apiKey === 'undefined')
  {
    options.logger.error('Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
  	return outputs.error(null, {message: 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js'});
  }

  const client = new maps.Client({});

  if(typeof waypoints === 'undefined') {
    waypoints = [];
  }

  var params = {
    key: apiKey,
    locations: locations
  }
debugger;
  client
    .elevation({
      params: params,
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
	findPlaceFromText
};
