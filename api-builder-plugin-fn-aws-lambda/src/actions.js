const aws = require("aws-sdk");

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

  const awsConfig = this.pluginConfig.aws;

  var logType = 'None';

  if (!func) {
		options.logger.error('The func parameter is missing.');
		return outputs.error(null, new Error('Missing required parameter: func'));
	}

  if(typeof awsConfig.credentials.region === 'undefined' || awsConfig.credentials.region == 'PROVIDE_YOUR_AWS_REGION' ||
    typeof awsConfig.credentials.accessKeyId === 'undefined' || awsConfig.credentials.accessKeyId == 'PROVIDE_YOUR_AWS_ACCESS_KEY_ID' ||
    typeof awsConfig.credentials.secretAccessKey === 'undefined' || awsConfig.credentials.secretAccessKey == 'PROVIDE_YOUR_AWS_SECRET')
  {
  	return outputs.error(null, new Error('Your AWS configuration is incomplete. Please check conf/aws-lambda.default.js'));
  }

  if(logResult) {
    logType = 'Tail';
  }

  awsCredentials = {
    region: awsConfig.credentials.region,
    accessKeyId: awsConfig.credentials.accessKeyId,
    secretAccessKey: awsConfig.credentials.secretAccessKey
  };
  aws.config.update(awsCredentials);

  var lambda = new aws.Lambda({region: awsConfig.credentials.region, apiVersion: '2015-03-31'});

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

  lambdaPromise = lambda.invoke(pullParams).promise();

  lambdaPromise.then(
    function(data) {
      if(logResult) {
        options.logger.debug(Buffer.from(data.LogResult, 'base64').toString('utf8'));
      }
      if(asynchronous && data.StatusCode == 202) {
        return outputs.next(null, 'Accepted');
      } else {
        return outputs.next(null, JSON.parse(data.Payload));
      }
    },
    function(error) {
      options.logger.error(error);
      return outputs.error(null, error);
    }
  )
}

module.exports = {
	invokeLambda
};
