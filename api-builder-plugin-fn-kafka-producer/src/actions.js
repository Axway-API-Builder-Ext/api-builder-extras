const { Kafka } = require('kafkajs')

// This just sets the configuration. The connection is created when you create a producer during the "publish" action
async function ensurekafkaProducer(action, pluginConfig) {
	if (!action.kafkaProducer) {
		const kafka = new Kafka(pluginConfig.clientConfiguration);
		action.kafkaProducer = kafka.producer();
	}
}

function buildMessage(value, key, partition) {
	let message = {};
	
	message.value = value;
	
	if (key != null) {
		message.key = key;
	}

	if (partition != null) {
		message.partition = partition;
	}
	
	return message;
}


function buildPayloads(params) {
	let payloads;
	
	// If we have messageObjects, then we want to ignore all other parameters since they'll be set here already
	if (params.messageObjects) {
		 const messageObjects = params.messageObjects; 
		 payloads = messageObjects;
	} else {
		// Create payloads from configured parameters
		const topic = params.topic;
		const supplied_messages = params.messages;
		const key = params.key;
		const partition = params.partition;
	
		// These two become required if messageObjects is absent
		if (!supplied_messages) {
			throw new Error('Missing required parameter: messages');
		}
		
		if (!topic) {
			throw new Error('Missing required parameter: topic');
		}
		
		let messages = new Array();
		// If one message was sent, then make sure we don't treat it like an array of characters
		if (typeof supplied_messages == "string") {
			var message = buildMessage(supplied_messages, key, partition);
			messages.push(message);
		} else {
			for (let message_value in supplied_messages) {
				var message = buildMessage(message_value, key, partition);
				messages.push(message);
			}
		}

		payloads = {topic: topic, messages: messages};
	}
	
	return payloads;
}


/**
 * Action method.
 *
 * @param {object} params - A map of all the parameters passed from the flow.
 * @param {object} options - The additional options provided from the flow
 *	 engine.
 * @param {object} options.pluginConfig - The service configuration for this
 *  plugin from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {object} options.logger - The API Builder logger which can be used
 *	 to log messages to the console. When run in unit-tests, the messages are
 *	 not logged.  If you wish to test logging, you will need to create a
 *	 mocked logger (e.g. using `simple-mock`) and override in
 *	 `MockRuntime.loadPlugin`.  For more information about the logger, see:
 *	 https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @param {*} [options.pluginContext] - The data provided by calling
 *	 `sdk.setContext(pluginContext)` in `getPlugin` in `index.js`.
 * @return {undefined}
 */
async function publish(params, {logger, pluginConfig}) {
	let payloads = buildPayloads(params);
	
	// Ensure we have a kafka connection
	await ensurekafkaProducer(this, pluginConfig);

	let result;
	
	try {
		await this.kafkaProducer.connect(pluginConfig.producerConfiguration);
		result = await this.kafkaProducer.send(payloads);
		return result;
	} catch (err) {
		throw new Error('Error sending message to Kafka: ' + err);
	}
}

module.exports = {
	publish
};
