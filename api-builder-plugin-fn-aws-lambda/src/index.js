const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');

const aws = require("aws-sdk");

/**
 * Resolves the API Builder plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig, options) {
	const sdk = new SDK();
	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
	const plugin = sdk.getPlugin();
	const lambdaClient = getAWSLambdaClient(pluginConfig);
	plugin.flownodes['lambda'].lambdaClient = lambdaClient;
	plugin.flownodes['lambda'].methods.invokeLambda.action = actions.invokeLambda.bind({lambdaClient});
	return plugin;
}

function getAWSLambdaClient(pluginConfig, options) {
	const awsConfig = pluginConfig.aws;

	if (typeof awsConfig.credentials.region === 'undefined' || awsConfig.credentials.region == 'PROVIDE_YOUR_AWS_REGION' ||
		typeof awsConfig.credentials.accessKeyId === 'undefined' || awsConfig.credentials.accessKeyId == 'PROVIDE_YOUR_AWS_ACCESS_KEY_ID' ||
		typeof awsConfig.credentials.secretAccessKey === 'undefined' || awsConfig.credentials.secretAccessKey == 'PROVIDE_YOUR_AWS_SECRET') 
	{
		if(options) {
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

	var lambdaClient = new aws.Lambda({ region: awsConfig.credentials.region, apiVersion: '2015-03-31' });
	return lambdaClient;
}

module.exports = getPlugin;
