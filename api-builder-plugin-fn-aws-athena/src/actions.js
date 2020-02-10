const AthenaExpress = require("athena-express");
const aws = require("aws-sdk");

/**
 * Action method.
 * @param {object} req - The flow request context passed in at runtime.  The
 *	 parameters are resolved as `req.params` and the available authorization
 * credentials are passed in as `req.authorizations`.
 * @param {object} outputs - A set of output callbacks.  Use it to signal an
 *	 event and pass the output result back to the runtime.  Only use an
 *	 output callback once and only after all asyncronous tasks complete.
 * @return {undefined}
 */
function query(req, outputs, options) {
  debugger;
  const awsConfig = this.pluginConfig.aws;
  const db = req.params.db;
	const table = req.params.table;
  const fields = req.params.fields;
  const limit = req.params.limit;

  if(typeof awsConfig.credentials.region === 'undefined' || awsConfig.credentials.region == 'PROVIDE_YOUR_AWS_REGION' ||
    typeof awsConfig.credentials.accessKeyId === 'undefined' || awsConfig.credentials.accessKeyId == 'PROVIDE_YOUR_AWS_ACCESS_KEY_ID' ||
    typeof awsConfig.credentials.secretAccessKey === 'undefined' || awsConfig.credentials.secretAccessKey == 'PROVIDE_YOUR_AWS_SECRET')
  {
  	return outputs.error(null, new Error('Your AWS-Athena configuration file is incomplete. Please check conf/aws-athena.default.js'));
  }


  if (!table) {
		return outputs.error(null, new Error('Missing required parameter: table'));
	}
  if (!fields) {
		return outputs.error(null, new Error('Missing required parameter: fields'));
	}
  if (!db) {
		return outputs.error(null, new Error('Missing required parameter: db'));
	}

  awsCredentials = {
    region: awsConfig.credentials.region,
    accessKeyId: awsConfig.credentials.accessKeyId,
    secretAccessKey: awsConfig.credentials.secretAccessKey
  };
  aws.config.update(awsCredentials);

  const athenaExpressConfig = {
    aws
  };

  const athenaExpress = new AthenaExpress(athenaExpressConfig);

  (async () => {
    let myQuery = {
        sql: `SELECT ${fields} FROM ${table}`,
        db: db
    };
    if(limit) {
      myQuery.sql = myQuery.sql + ` LIMIT ${limit}`
    } else {
      myQuery.sql = myQuery.sql + ` LIMIT 5`
    }
    try {
      var results = await athenaExpress.query(myQuery);
      return outputs.next(null, results);
    } catch (error) {
      options.logger.error(`Failed to execute query: ${error}`)
      return outputs.error(null, error);
    }
  })();
}

module.exports = {
	query
};
