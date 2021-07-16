const { MongoClient } = require('mongodb')
/**
 * Action method.
 *
 * @param {object} params - A map of all the parameters passed from the flow.
 * @param {object} options - The additional options provided from the flow
 *	 engine.
 * @param {object} options.pluginConfig - The service configuration for this
 *	 plugin from API Builder config.pluginConfig['api-builder-plugin-pluginName']
 * @param {object} options.logger - The API Builder logger which can be used
 *	 to log messages to the console. When run in unit-tests, the messages are
 *	 not logged.  If you wish to test logging, you will need to create a
 *	 mocked logger (e.g. using `simple-mock`) and override in
 *	 `MockRuntime.loadPlugin`.  For more information about the logger, see:
 *	 https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @param {*} [options.pluginContext] - The data provided by passing the
 *	 context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *	 in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *	 does not define "next", the first defined output).
 */

 

 async function insert(params, options) {
	const { documents, collectionName } = params;
	const { logger } = options;
	var mongoCollection = options.pluginContext.mongoCollection;
	if (!documents) {
		throw new Error('Missing required parameter: documents');
	}
	if(collectionName) {
		mongoCollection = options.pluginContext.mongoClient.db().collection(collectionName);
	}
	let insertedDocuments;

	if(Array.isArray(documents)) {
		insertedDocuments = await mongoCollection.insertMany(documents);
	} else {
		insertedDocuments = await mongoCollection.insertOne(documents);
	}

	return insertedDocuments;
}

async function find(params, options) {
	var { filter, data, collectionName, limit, skip } = params;
	const { logger } = options;
	var mongoCollection = options.pluginContext.mongoCollection;

	if(collectionName) {
		mongoCollection = options.pluginContext.mongoClient.db().collection(collectionName);
	}
	if (!filter) {
		filter = {};
	}
	if (data) {
		filter = await interpolate(filter, data, options);
	}
	logger.info(`Find documents using filter: ${JSON.stringify(filter)}`);
	const findResult = await mongoCollection.find(filter, {limit: limit, skip: skip} ).toArray();
	if (findResult.length==0) {
		options.logger.info(`Found no document with filter: ${JSON.stringify(filter)}`);
		return options.setOutput('noMatch', []);
	} else {
		return findResult;
	}
}

async function update(params, options) {
	var { update, filter, data, collectionName, updateOnlyOne, failOnNoMatch } = params;
	const { logger } = options;
	var mongoCollection = options.pluginContext.mongoCollection;

	if(collectionName) {
		mongoCollection = options.pluginContext.mongoClient.db().collection(collectionName);
	}

	if (!update) {
		throw new Error('Missing required parameter: update');
	}
	if (!filter) {
		throw new Error('Missing required parameter: filter');
	}
	if (data) {
		filter = await interpolate(filter, data, options);
	}

	update = await interpolate(update, data, options);
	let updateResult;
	if(updateOnlyOne) {
		const documentsToUpdate = await mongoCollection.find(filter).toArray();
		if(documentsToUpdate.length>1) {
			throw new Error(`Update of only one document failed, as the filter: ${JSON.stringify(filter)} matches ${documentsToUpdate.length} documents.`);
		}
		updateResult = await mongoCollection.findOneAndUpdate(filter, update);
	} else {
		logger.info(`Update documents: ${JSON.stringify(update)} using filter: ${JSON.stringify(filter)}`);
		updateResult = await mongoCollection.updateMany(filter, update);
	}
	if(failOnNoMatch && updateResult.modifiedCount==0) {
		throw new Error(`Update failed, as the filter: ${JSON.stringify(filter)} matches NO documents.`);
	}
	
	return updateResult;
}

async function mongoDelete(params, options) {
	const { data, collectionName, deleteOnlyOne, failOnNoMatch } = params;
	let { filter } = params;
	const { logger } = options;
	var mongoCollection = options.pluginContext.mongoCollection;

	if(collectionName) {
		mongoCollection = options.pluginContext.mongoClient.db().collection(collectionName);
	}

	if (!filter) {
		throw new Error('Missing required parameter: filter');
	}
	if (data) {
		filter = await interpolate(filter, data, options);
	}

	let deleteResult;
	if(deleteOnlyOne) {
		const documentsToDelete = await mongoCollection.find(filter).toArray();
		if(documentsToDelete.length>1) {
			throw new Error(`Deletion of only one document failed, as the filter: ${JSON.stringify(filter)} matches ${documentsToDelete.length} documents.`);
		}
		deleteResult = await mongoCollection.deleteOne(filter);
	} else {
		deleteResult = await mongoCollection.deleteMany(filter);
	}
	if(failOnNoMatch && deleteResult.deletedCount==0) {
		throw new Error(`Delete failed, as the filter: ${JSON.stringify(filter)} matches NO documents.`);
	}
	return deleteResult;
}

async function countDocuments(params, options) {
	const { data, collectionName } = params;
	let { filter } = params;
	const { logger } = options;
	var mongoCollection = options.pluginContext.mongoCollection;

	if(collectionName) {
		mongoCollection = options.pluginContext.mongoClient.db().collection(collectionName);
	}

	if (!filter) {
		filter = {};
	}

	if (data) {
		filter = await interpolate(filter, data, options);
	}
	const documentCount = await mongoCollection.countDocuments(filter);
	return documentCount;
}



async function interpolate(string, data, options) {
	if(string) {
		string = JSON.stringify(string);
	} else {
		return;
	}
	options.logger.info(`Got string: ${string}`);
	var result = string.replace(/"\${([^}]+)}"/g, (_, target) => {
		let keys = target.split(".");
		return keys.reduce((prev, curr) => {
			if (curr.search(/\[/g) > -1) {
				//if element/key in target array is array, get the value and return
				let m_curr = curr.replace(/\]/g, "");
				let arr = m_curr.split("[");
				return arr.reduce((pr, cu) => {
					if(pr[cu] == undefined) {
						throw new Error(`Missing data for selector: \$\{${curr}\}`);
					}
					return pr && pr[cu];
				}, prev);
			} else {
				//else it is a object, get the value and return
				if(prev[curr] == undefined) {
					throw new Error(`Missing data for selector: \$\{${curr}\}`);
				}
				return prev && prev[curr];
			}
		}, data);
	});
	options.logger.info(`Interpolated result: ${result}`);
	return JSON.parse(result);
};


module.exports = {
	insert,
	find,
	update,
	mongoDelete,
	countDocuments
};
