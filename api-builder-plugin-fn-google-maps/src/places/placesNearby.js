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
 function placesNearby(req, outputs, options) {
	const location = req.params.location;
  const radius = req.params.radius;
  const keyword = req.params.keyword;
  const language = req.params.language;
  const minprice = req.params.minprice;
  const maxprice = req.params.maxprice;
  const name = req.params.name;
  const opennow = req.params.opennow;
  const rankby = req.params.rankby;
  const type = req.params.type;
  const pagetoken = req.params.pagetoken;

  if(typeof this.pluginConfig.google === 'undefined') {
    options.logger.error('Google-Configuration not found. Please make sure conf/google-maps.default.js is present and configured.');
    return outputs.error(null, {message: 'Google-Configuration not found. Please make sure conf/google-maps.default.js is present and configured.'});
  }

  const apiKey = this.pluginConfig.google.credentials.apiKey;
  const client = this.mapsClient;

	if (!location) {
		options.logger.error('The location parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: location'});
	}
  if (!radius) {
		options.logger.error('The radius parameter is missing.');
		return outputs.error(null, {message:'Missing required parameter: radius'});
	}
  if(typeof apiKey === 'undefined')
  {
    options.logger.error('Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js');
  	return outputs.error(null, {message: 'Google API-Key is missing. Please complete your configuration in conf/google-maps.default.js'});
  }

  var params = {
    key: apiKey,
    location: location,
    radius: radius,
    keyword: keyword,
    language: language,
    minprice: minprice,
    maxprice: maxprice,
    name: name,
    opennow: opennow,
    rankby: rankby,
    type: type,
    pagetoken: pagetoken
  }

  client
    .placesNearby({
      params: params,
      timeout: 10000 // milliseconds
    })
    .then(response => {
      if(response.data.status == 'ZERO_RESULTS') {
        return outputs.noResults(null, response.data);
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
	placesNearby
};
