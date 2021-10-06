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
 * 	 to the console. See https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/project/logging/index.html
 *
 * @return {undefined}
 */
function reverseGeocode(req, outputs, options) {
	if ((req.params == null) || (!req.params.latlng && !req.params.place_id)) {
		options.logger.error('You must at least provide latlng or place_id');
		return outputs.error(null, {message:'You must at least provide latlng or place_id'});
	}
  const latlng = req.params.latlng;
  const place_id = req.params.place_id;
  const language = req.params.language;
  const result_type = req.params.result_type;
  const location_type = req.params.location_type;

  const apiKey = this.pluginConfig.google.credentials.apiKey;
  const client = this.mapsClient;

  if(typeof apiKey === 'undefined')
  {
    options.logger.error('Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
  	return outputs.error(null, {message: 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js'});
  }

  var params = {
    key: apiKey,
    language: language,
    result_type: result_type,
    location_type: location_type
  }

  if(typeof latlng != 'undefined') {
    params.latlng = latlng;
  }
  if(typeof place_id != 'undefined') {
    params.place_id = place_id;
  }

  client
    .reverseGeocode({
      params: params,
      timeout: 10000 // milliseconds
    })
    .then(response => {
      if(response.data.status == 'ZERO_RESULTS') {
        return outputs.notFound(null, response.data);
      } else if(response.data.status != 'OK') {
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
	reverseGeocode
};
