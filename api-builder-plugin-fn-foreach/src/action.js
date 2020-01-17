const APIBuilder = require('@axway/api-builder-runtime');

exports = module.exports = async function (req, cb) {
	const server = APIBuilder.getGlobal();

	const flowName = req.params.flow;
	const items = req.params.items || [];

	if (!server.getFlow(flowName)) {
		return cb.flowNotFound(null, flowName);
	}

	try {
		const results = [];
		for (let i = 0; i < items.length; ++i) {
			results[i] = await server.flowManager.flow(flowName, items[i], { logger: server.logger });
		}
		return cb.next(null, results);
	} catch (ex) {
		return cb.error(null, ex);
	}
};
