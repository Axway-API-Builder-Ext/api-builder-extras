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
 function geocode(req, outputs, options) {
	const address = req.params.address;
  const bounds = req.params.bounds;
  const language = req.params.language;
  const region = req.params.region;
  const components = req.params.components;



  const apiKey = this.pluginConfig.google.credentials.apiKey;
  const client = this.mapsClient;

	if (!address) {
		options.logger.error('The address parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: address'});
	}
  if(typeof apiKey === 'undefined')
  {
    options.logger.error('Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
  	return outputs.error(null, {message: 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js'});
  }

  var params = {
    key: apiKey,
    address: address,
    language: language,
    region: region
  }

  if(typeof bounds != 'undefined') {
    params.bounds = bounds;
  }
  if(typeof components != 'undefined') {
    params.components = components;
  }

  client
    .geocode({
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
	geocode
};
