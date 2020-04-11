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
function invokeLambda(req, outputs, options) {

  const func = req.params.func;
  const logResult = req.params.logResult;
  const payload = req.params.payload;
  const asynchronous = req.params.asynchronous;

  var logType = 'None';
  const lambda = this.lambdaClient;

  if (!func) {
		options.logger.error('The func parameter is missing.');
		return outputs.error(null, {message: 'Missing required parameter: func'});
	}

  if(logResult) {
    logType = 'Tail';
  }

  var lambdaPayload = payload;
  if(typeof payload === 'object') {
    lambdaPayload = JSON.stringify(payload);
  }

  var invocationType = 'RequestResponse';
  if(asynchronous) {
    invocationType = 'Event'
  }

  var pullParams = {
    FunctionName : func,
    InvocationType : invocationType,
    LogType : logType,
    Payload : lambdaPayload
  };
  try {
    callLambda(options, outputs, lambda, pullParams, logResult, asynchronous);
  } catch (error) {
    options.logger.error(`Failed to execute query: ${error}`)
    return outputs.error(null, error);
  }
}

function callLambda(options, outputs, lambda, pullParams, logResult, asynchronous) {

  lambdaPromise = lambda.invoke(pullParams, function(err, data) {
    if(err) {
      return outputs.error(null, {message: error});
    } else {
      if(asynchronous && data.StatusCode == 202) {
        return outputs.next(null, 'Accepted');
      } else {
        debugger;
        return outputs.next(null, JSON.parse(data.Payload));
      }      
    }
  });
}

module.exports = {
	invokeLambda
};
