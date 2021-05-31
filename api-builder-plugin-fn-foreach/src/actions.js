const APIBuilder = require('@axway/api-builder-runtime');

async function flowforeach(params, options) {
	const server = APIBuilder.getGlobal();

	const flowName = params.flow;
	const items = params.items || [];

	if (!server.getFlow(flowName)) {
		return options.setOutput('flowNotFound', `The flow with name: '${flowName}' could not be found.`);
	}
	try {
		const results = [];
		for (let i = 0; i < items.length; ++i) {
			results[i] = await server.flowManager.flow(flowName, items[i], { options });
		}
		return results;
	} catch (ex) {
		throw ex;
	}
};

module.exports = {
	flowforeach
};