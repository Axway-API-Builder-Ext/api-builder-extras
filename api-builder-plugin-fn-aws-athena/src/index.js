const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');

const AthenaExpress = require("athena-express");
const aws = require("aws-sdk");

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
	const plugin = sdk.getPlugin();
	const athenaClient = getAWSAthenaClient(pluginConfig);
	plugin.flownodes['athena'].athenaClient = athenaClient;
	plugin.flownodes['athena'].methods.query.action = actions.query.bind({athenaClient});
	return plugin;
}

function getAWSAthenaClient(pluginConfig, options) {
	const awsConfig = pluginConfig.aws;

	if (typeof awsConfig.credentials.region === 'undefined' || awsConfig.credentials.region == 'PROVIDE_YOUR_AWS_REGION' ||
		typeof awsConfig.credentials.accessKeyId === 'undefined' || awsConfig.credentials.accessKeyId == 'PROVIDE_YOUR_AWS_ACCESS_KEY_ID' ||
		typeof awsConfig.credentials.secretAccessKey === 'undefined' || awsConfig.credentials.secretAccessKey == 'PROVIDE_YOUR_AWS_SECRET') {
		if (options) {
			options.logger.error('Your AWS configuration is incomplete. Please check conf/aws-lambda.default.js');
		} else {
			console.error('Your AWS configuration is incomplete. Please check conf/aws-lambda.default.js');
		}
		return null;
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

	return athenaExpress;
}

module.exports = getPlugin;
