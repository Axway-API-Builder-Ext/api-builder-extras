const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../../src');

const { ElasticsearchClient } = require('../../src/actions/ElasticsearchClient');
const { setupElasticsearchMock } = require('../basic/setupElasticsearchMock');

describe('Basic: flow-node elasticsearch', () => {
	let plugin;
	let flowNode;
	var client = new ElasticsearchClient({node:'http://mock-node:9200'}).client;
	var pluginConfig = require('../config/basic-config.js').pluginConfig['@axway-api-builder-ext/api-builder-plugin-fn-elasticsearch'];

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, pluginConfig);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('elasticsearch');
	});

	describe('#search actions', () => {
		it('should pass without any given parameter', async () => {
			const mockedFn = setupElasticsearchMock(client, 'search', './test/mock/search_all_response.json');
			const { value, output } = await flowNode.search({});

			expect(value.statusCode).to.equals(200);
			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			expect(mockedFn.lastCall.arg).to.deep.equals({});
		});

		it('should pass when having an index parameter given', async () => {
			const mockedFn = setupElasticsearchMock(client, 'search', './test/mock/search_all_response.json');
			const inputParameter = { index: 'logstash-openlog' };

			const { value, output } = await flowNode.search(inputParameter);
			expect(value.statusCode).to.equals(200);
			expect(value.body.hits).to.exist;
			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
		});

		it('should pass when having a query parameter given', async () => {
			const mockedFn = setupElasticsearchMock(client, 'search', './test/mock/search_all_response.json');

			const bodyParams = {
				"query": {
					"bool": {
						"must": [
							{ "match": { "title": "Search" } },
							{ "match": { "content": "Elasticsearch" } }
						]
					}
				}
			};

			const inputParameter = {
				index: 'logstash-openlog',
				...bodyParams
			}

			const elasticRequest = {
				index: 'logstash-openlog',
				body: bodyParams
			}

			const { value, output } = await flowNode.search(inputParameter);
			expect(value.statusCode).to.equals(200);
			expect(value.body.hits).to.exist;
			expect(output).to.equal('next');
			expect(mockedFn.callCount).to.equals(1);
			expect(mockedFn.lastCall.arg).to.deep.equals(elasticRequest);
		});

		it('should fail with an invalid sort key given', async () => {
			const mockedFn = setupElasticsearchMock(client, 'search', './test/mock/wrong_sort_column.json', true);

			const inputParameter = { index: 'logstash-openlog', sort: 'XZY:desc' };
			const { value, output } = await flowNode.search(inputParameter);

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'No mapping found for [XZY] in order to sort on');
			expect(output).to.equal('error');
			if(typeof mockedFn !== 'undefined') {
				expect(mockedFn.lastCall.arg).to.deep.equals(inputParameter);
			}
		});

		it('should be okay having suggest_field and suggest_text only, as suggest_mode defaults to missing', async () => {
			const mockedFn = setupElasticsearchMock(client, 'search', './test/mock/suggest_response.json');
			const inputParameter = {
				suggest_field: 'circuitPath.execTime',
				//suggest_mode: 'missing', // This is not given as it should default to missing
				suggest_text: 'Some text'
			};

			const elasticRequest = {
				...inputParameter, 
				suggest_mode: 'missing'
			};

			const { value, output } = await flowNode.search(inputParameter);
			expect(output).to.equal('next');
			expect(value.statusCode).to.equal(200);
			if(typeof mockedFn !== 'undefined') {
				expect(mockedFn.callCount).to.equals(1);
				// Validate all given parameters has been passed to the JS-Elastic client
				expect(mockedFn.lastCall.arg).to.deep.equals(elasticRequest);
			}
		});

		it('should pass with all possible parameters', async () => {
			const mockedFn = setupElasticsearchMock(client, 'search', './test/mock/search_all_response.json');

			const bodyParams = {
				"query": {
					"bool": {
						"must": [
							{ "match": { "groupName": "QuickStart Group" } },
							{ "match": { "hostname": "api-env" } }
						]
					}
				}
			};
			const queryParams = {
				"size": 30,
				"from": 2,
				"sort": "_score:asc",
				"_source": "true",
				"_source_excludes": ["circuitPath, tags"],
				"_source_includes": ["field3, field4"],
				"allow_no_indices": true,
				"allow_partial_search_results": true,
				//"default_operator": 'AND', // Seems not supported by the Node-Library
				"request_cache": true,
				"rest_total_hits_as_int": true,
				"batched_reduce_size": 3,
				"ccs_minimize_roundtrips": true,
				"docvalue_fields": "field1, field2",
				"expand_wildcards": "all",
				"explain": true,
				"ignore_throttled": true,
				"ignore_unavailable": true,
				"lenient": true,
				"max_concurrent_shard_requests": 15,
				"pre_filter_shard_size": 99,
				"preference": "A preference",
				"q": "Lucene query",
				"routing": "Some routing",
				"search_type": "query_then_fetch",
				"seq_no_primary_term": true,
				"stats": "tag ABC",
				"stored_fields": "field1, field2",
				"suggest_field": "circuitPath.execTime",
				"suggest_mode": "popular",
				"suggest_size": 3,
				"suggest_text": "field-ABC",
				"terminate_after": 6,
				"timeout": "90s",
				"track_scores": false,
				"track_total_hits": true,
				"typed_keys": false,
				"version": false
			};

			const inputParameter = {
				index: 'logstash-openlog',
				...bodyParams, 
				...queryParams
			}

			const elasticRequest = {
				index: 'logstash-openlog',
				body: {...bodyParams}, 
				...queryParams
			}

			const { value, output } = await flowNode.search(inputParameter);
			expect(value.statusCode).to.equals(200);
			expect(output).to.equal('next');
			if(typeof mockedFn !== 'undefined') {
				expect(mockedFn.callCount).to.equals(1);
				// Validate all given parameters has been passed to the JS-Elastic client
				expect(mockedFn.lastCall.arg).to.deep.equals(elasticRequest);
			}
		});
	});
});
