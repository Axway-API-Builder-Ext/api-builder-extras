const APIBuilder = require('@axway/api-builder-runtime');
const runPublish = require('./publisher');
const runSubscribe = require('./subscriber');

module.exports = () => {

	// Here is our actions state
	let subscriberApi;

	async function publish(params, { logger, pluginConfig, pluginContext }) {
		const { topic, message } = params;
		await runPublish(pluginContext.solace, topic, message, pluginConfig, logger);
		return 'Publisher Status: OK';
	}

	async function subscribe(params, { logger, pluginConfig, pluginContext }) {
		const { topic, flowName } = params;
		// Subscribe to messages on Solace message router
		// Stateful action - execute only once if the subscriber API is not prepared
		if (!subscriberApi) {
			subscriberApi = await runSubscribe(pluginContext.solace, topic, listener, pluginConfig, logger);
		} else if(!subscriberApi.isConnected()) {
			await subscriberApi.connect();
		}
		return 'Subscriber Status: READY!';

		// Callback function that will be executed when events happen
		async function listener (message) {
			const server = APIBuilder.getGlobal();
			const messageContent = JSON.parse(message.getBinaryAttachment());
			logger.info(`Received message: ${messageContent}`);
			// logger.debug(`Details: ${message.dump()}`);
			const flowInput = { params: { models: messageContent } };
			logger.info(`About to invoke the subscribed flow: ${flowName}`);
			logger.info(`With data to it: ${messageContent}`);
			await server.flowManager.flow(flowName, flowInput, { logger: server.logger });
		}
	}

	return {
		publish, subscribe
	};
}
