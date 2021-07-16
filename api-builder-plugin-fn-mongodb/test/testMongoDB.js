const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');
const path = require('path');
const fs = require('fs');
const envLoader = require('dotenv');
const simple = require('simple-mock');
const { MongoClient } = require('mongodb');

describe('flow-node fn-mongodb', () => {
	let plugin;
	let flowNode;
	let pluginConfig
	let options;
	var mongoClient;
	var mongoCollection;
	before(async () => {
		// Loads test environment variables from .env if the file exists
		const envFilePath = path.join(__dirname, '.env');
		if (fs.existsSync(envFilePath)) {
			envLoader.config({ path: envFilePath });
		}

		options = {
			logger: {
				info: simple.mock(),
				debug: simple.mock(),
				trace: simple.mock(),
				error: simple.mock()
			}, 
			validateOutputs: true
		};

		pluginConfig = {
			url: process.env.MONGODB_URL,
			collection: process.env.MONGODB_COLLECTION
		}
		mongoClient = new MongoClient(pluginConfig.url);
		mongoClient.connect();
		mongoCollection = mongoClient.db().collection(pluginConfig.collection);

		pluginConfig.mongoTestClient = mongoClient;
		pluginConfig.mongoTestCollection = mongoCollection;
	});

	after(async () => {
		mongoClient.close();
	});

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig, options);
		flowNode = plugin.getFlowNode('fn-mongodb');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal(['fn-mongodb']);
			expect(flowNode).to.be.a('object');

			expect(flowNode.name).to.equal('MongoDB');
		});

		it('should define valid flow-nodes', () => {
			plugin.validate();
		});
	});

	describe('#insert', () => {
		let randomId;
		let testCollectionName;
		
		before(async () => {
			randomId = getRandomInt(5000);
			testCollectionName = `testCollection-${randomId}`;
		});

		it('should error when missing required parameter document', async () => {
			const { value, output } = await flowNode.insert({ documents: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: documents');
			expect(output).to.equal('error');
		});

		it('should error with an invalid document', async () => {
			const { value, output } = await flowNode.insert({ documents: "XXXX" });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Cannot create property \'_id\' on string \'XXXX\'');
			expect(output).to.equal('error');
		});

		it('should succeed with a single valid document', async () => {
			const { value, output } = await flowNode.insert({ documents: {test: "123" } });

			expect(value).to.have.property('insertedId');
			expect(value.acknowledged).to.equal(true);
			expect(output).to.equal('next');
		});

		it('should succeed with a single valid document using a diffent collection', async () => {
			const { value, output } = await flowNode.insert({ documents: {_id: randomId, test: "123" }, collectionName: testCollectionName });

			expect(value).to.have.property('insertedId');
			expect(value.acknowledged).to.equal(true);
			expect(output).to.equal('next');
			// Check the document has been inserted in a different collection
			const insertedObject = await mongoClient.db().collection(testCollectionName).findOne({ "_id" : randomId});
			expect(insertedObject).to.deep.equal({"_id" : randomId, test: "123" });
		});

		it('should succeed with an array of valid documents', async () => {
			const { value, output } = await flowNode.insert({ documents: [ { first: "123" }, { second: "789" } ] });

			expect(value).to.have.property('insertedIds');
			expect(value.insertedCount).to.equal(2);
			expect(value.acknowledged).to.equal(true);
			expect(output).to.equal('next');
		});
	});

	describe('#find', () => {
		let randomId;
		let testCollectionName;
		
		before(async () => {
			
			randomId = getRandomInt(5000);
			testCollectionName = `testCollection-${randomId}`;
			// Insert some test documents to be retrieved / using a custom collection
			await mongoClient.db().collection(testCollectionName).insertMany([
				{ "_id" : `1-${randomId}`, test: "123"},
				{ "_id" : `2-${randomId}`, test: "456"},
				{ "_id" : `3-${randomId}`, test: 789 },
				{ "_id" : `4-${randomId}`, test: 31233 },
				{ "_id" : `5-${randomId}`, test: 312312 },
				{ "_id" : `6-${randomId}`, test: "3121232" },
				{ "_id" : `7-${randomId}`, test: 099909 },
				{ "_id" : `8-${randomId}`, test: 6546577 },
				{ "_id" : `9-${randomId}`, test: 75898 },
				{ "_id" : `10-${randomId}`, test: 5342123 },
			]);
		});

		it('should succeed without any filter', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName});

			expect(value).to.be.an('array').that.does.not.include(3);
			expect(value).to.have.lengthOf(10);
			expect(output).to.equal('next');
		});

		it('should succeed with a filter hardcoded filter', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName, filter: { test: "456" } });

			expect(value).to.be.an('array').that.does.not.include(3);
			expect(value).to.have.lengthOf(1);
			expect(value[0]).and.to.have.property('test', '456');
			expect(output).to.equal('next');
		});

		it('should succeed with a flexible filter', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName, filter: { "test": "${documentId}" }, data: { documentId: "\"456\""} });

			expect(value).to.be.an('array').that.does.not.include(3);
			expect(value).to.have.lengthOf(1);
			expect(value[0]).and.to.have.property('test', '456');
			expect(output).to.equal('next');
		});

		it('should succeed with a nested flexible filter quoted value', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName, filter: { test: "${params.documentId}" }, data: { params: { documentId: "\"456\"" } } });

			expect(value).to.be.an('array').that.does.not.include(3);
			expect(value).to.have.lengthOf(1);
			expect(value[0]).and.to.have.property('test', '456');
			expect(output).to.equal('next');
		});

		it('should succeed with a nested flexible filter', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName, filter: { test: "${params.documentId}" }, data: { params: { documentId: "789" } } });

			expect(value).to.be.an('array').that.does.not.include(3);
			expect(value).to.have.lengthOf(1);
			expect(value[0]).and.to.have.property('test', 789);
			expect(output).to.equal('next');
		});

		it('should succeed without a filter limited to 2 results', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName, limit: 2 });

			expect(value).to.have.lengthOf(2);
			expect(output).to.equal('next');
		});

		it('should succeed without a filter, skipped the first 3 entries limited to 4 results', async () => {
			const { value, output } = await flowNode.find({collectionName: testCollectionName, skip: 3, limit: 4 });

			expect(value[0]).and.to.have.property('test', 31233);
			expect(value).to.have.lengthOf(4);
			expect(output).to.equal('next');
		});
	});

	describe('#update', () => {
		let randomId;
		let testCollectionName;
		
		before(async () => {
			
			randomId = getRandomInt(5000);
			testCollectionName = `testCollection-${randomId}`;
			// Insert some test documents to be retrieved / using a custom collection
			await mongoClient.db().collection(testCollectionName).insertMany([
				{ "_id" : `1-${randomId}`, test: "123", attr2: "A"},
				{ "_id" : `2-${randomId}`, test: "456", attr2: "A"},
				{ "_id" : `3-${randomId}`, test: 789, attr2: "B"}
			]);
		});

		it('should error when missing required parameter update', async () => {
			const { value, output } = await flowNode.update({ update: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: update');
			expect(output).to.equal('error');
		});

		it('should error when missing required parameter filter', async () => {
			const { value, output } = await flowNode.update({ update: {}, filter: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filter');
			expect(output).to.equal('error');
		});

		it('should succeed with a given hardcoded filter matching to one document', async () => {
			const { value, output } = await flowNode.update({collectionName: testCollectionName, filter: { test: "${test}" }, data: { test: "789"} , update: { $set: { test2: "ABC" } } });

			expect(value).to.deep.equal({acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: null});
			// Check the document that has been updated
			const updatedObject = await mongoClient.db().collection(testCollectionName).findOne({ "_id" : `3-${randomId}`});
			expect(updatedObject).to.deep.equal({"_id" : `3-${randomId}`, test: 789, attr2: "B", test2: "ABC" });
			expect(output).to.equal('next');
		});

		it('should succeed with a given hardcoded filter matching two documents', async () => {
			const { value, output } = await flowNode.update({collectionName: testCollectionName, filter: { attr2: "A" }, update: { $set: { test2: "XYZ" } } });

			expect(value).to.deep.equal({acknowledged: true, matchedCount: 2, modifiedCount: 2, upsertedCount: 0, upsertedId: null});
			// Check one of the documents that has been updated
			const updatedObject = await mongoClient.db().collection(testCollectionName).findOne({ "_id" : `2-${randomId}`});
			expect(updatedObject).to.deep.equal({"_id" : `2-${randomId}`, "test": "456", attr2: "A", test2: "XYZ" });
			expect(output).to.equal('next');
		});

		it('should fail with a given hardcoded filter matching two documents - Option Update One set', async () => {
			const { value, output } = await flowNode.update({collectionName: testCollectionName, updateOnlyOne: true, filter: { attr2: "A" }, update: { $set: { test2: "ABC" } } });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Update of only one document failed, as the filter: {"attr2":"A"} matches 2 documents.');
			expect(output).to.equal('error');
		});

		it('should fail with a given hardcoded filter matching NO documents - Option FailOnNoMatch set', async () => {
			const { value, output } = await flowNode.update({collectionName: testCollectionName, failOnNoMatch: true, filter: { attr2: "XYZ" }, update: { $set: { test2: "ABC" } } });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Update failed, as the filter: {"attr2":"XYZ"} matches NO documents.');
			expect(output).to.equal('error');
		});
	});

	describe('#delete', () => {
		let randomId;
		let testCollectionName;
		
		before(async () => {
			
			randomId = getRandomInt(5000);
			testCollectionName = `testCollection-${randomId}`;
			// Insert some test documents to be retrieved / using a custom collection
			await mongoClient.db().collection(testCollectionName).insertMany([
				{ "_id" : `1-${randomId}`, test: "123", attr2: "A"},
				{ "_id" : `2-${randomId}`, test: "456", attr2: "A"},
				{ "_id" : `3-${randomId}`, test: 789, attr2: "B"},
				{ "_id" : `4-${randomId}`, test: 312, attr2: "B"},
				{ "_id" : `5-${randomId}`, test: "312", attr2: "C"},
				{ "_id" : `6-${randomId}`, test: "353", attr2: "C"}
			]);
		});

		it('should error when missing required parameter filter', async () => {
			const { value, output } = await flowNode.update({ update: {}, filter: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filter');
			expect(output).to.equal('error');
		});

		it('should succeed with a given hardcoded filter matching to one document', async () => {
			const { value, output } = await flowNode.mongoDelete({collectionName: testCollectionName, filter: { test: "456" } });

			expect(value).to.deep.equal({ acknowledged: true, deletedCount: 1 });
			expect(output).to.equal('next');
		});

		it('should succeed with a given flexible filter matching to two documents', async () => {
			const { value, output } = await flowNode.mongoDelete({collectionName: testCollectionName, filter: { attr2: "${attr2}" }, data: { attr2: "\"B\""} } );

			expect(value).to.deep.equal({ acknowledged: true, deletedCount: 2 });
			expect(output).to.equal('next');
		});

		it('should fail if multiple documents are selected for deletion - Option deleteOnlyOne set', async () => {
			const { value, output } = await flowNode.mongoDelete({collectionName: testCollectionName, deleteOnlyOne: true, filter: { attr2: "C" } });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Deletion of only one document failed, as the filter: {"attr2":"C"} matches 2 documents.');
			expect(output).to.equal('error');
		});

		it('should fail with a given hardcoded filter matching NO documents - Option FailOnNoMatch set', async () => {
			const { value, output } = await flowNode.mongoDelete({collectionName: testCollectionName, failOnNoMatch: true, filter: { attr2: "XYZ" } });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Delete failed, as the filter: {"attr2":"XYZ"} matches NO documents.');
			expect(output).to.equal('error');
		});
	});

	describe('#countDocuments', () => {
		before(async () => {
			
			randomId = getRandomInt(5000);
			testCollectionName = `testCollection-${randomId}`;
			// Insert some test documents to be counted
			await mongoClient.db().collection(testCollectionName).insertMany([
				{ "_id" : `1-${randomId}`, test: "123", attr2: "A"},
				{ "_id" : `2-${randomId}`, test: "456", attr2: "A"},
				{ "_id" : `3-${randomId}`, test: 789, attr2: "B"},
				{ "_id" : `4-${randomId}`, test: 312, attr2: "B"},
				{ "_id" : `5-${randomId}`, test: "312", attr2: "C"},
				{ "_id" : `6-${randomId}`, test: "353", attr2: "C"}
			]);
		});

		it('should succeed without any filter counting all documents', async () => {
			const { value, output } = await flowNode.countDocuments({ collectionName: testCollectionName });

			expect(value).to.equal(6);
			expect(output).to.equal('next');
		});

		it('should succeed using a flexible filter', async () => {
			const { value, output } = await flowNode.countDocuments({ collectionName: testCollectionName, filter: { "attr2": "${attr2}" }, data: { attr2: "\"C\""} } );

			expect(value).to.equal(2);
			expect(output).to.equal('next');
		});
	});
});

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}
