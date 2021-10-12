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
 function placeDetails(req, outputs, options) {
	const place_id = req.params.place_id;
  const language = req.params.language;
  const region = req.params.region;
  const sessiontoken = req.params.sessiontoken;
  const fields = req.params.fields;

  if(typeof this.pluginConfig.google === 'undefined') {
    options.logger.error('Google-Configuration not found. Please make sure conf/google-maps.default.js is present and configured.');
    return outputs.error(null, {message: 'Google-Configuration not found. Please make sure conf/google-maps.default.js is present and configured.'});
  }

  const apiKey = this.pluginConfig.google.credentials.apiKey;
  const client = this.mapsClient;

	if (!place_id) {
		options.logger.error('The place_id parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: place_id'});
	}
  if(typeof apiKey === 'undefined')
  {
    options.logger.error('Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
  	return outputs.error(null, {message: 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js'});
  }

  if(typeof waypoints === 'undefined') {
    waypoints = [];
  }

  var params = {
    key: apiKey,
    place_id: place_id,
    language: language,
    region: region,
    sessiontoken: sessiontoken,
    fields: fields
  }

  client
    .placeDetails({
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
	placeDetails
};
