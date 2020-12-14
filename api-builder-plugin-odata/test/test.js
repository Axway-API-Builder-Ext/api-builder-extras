const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('flow-node odata', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		plugin.setOptions({ validateOutputs: true });
		flowNode = plugin.getFlowNode('odata');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'odata'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('OData');
			expect(flowNode.description).to.equal('OData Flow node');
			expect(flowNode.icon).to.be.a('string');
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#createQuery smoke tests', () => {
		it('should error when missing required parameter data', async () => {
			const { value, output } = await flowNode.createQuery({ data: null });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: data');
			expect(output).to.equal('error');
		});

		it('should return with an empty query string when not giving any options', async () => {
			const { value, output } = await flowNode.createQuery({ data: { some: "data"} });

			expect(value).to.equal('');
			expect(output).to.equal('next');
		});

		it('should fail if the requested data cannot be found in the given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { some: "data"}, 
				filter: { "PropName": "${unknownProp}" }
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing data for selector: ${unknownProp}');
			expect(output).to.equal('error');
		});

		it('should fail if the requested data cannot be found in the given data (as an array)', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: {  cars: ["Saab", "Volvo", "BMW"] },
				filter: { "PropName": "${CARS[1]}" }
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing data for selector: ${CARS[1]}');
			expect(output).to.equal('error');
		});
	});

	describe('#createQuery filter tests', () => {
		it('should return handle the filter parameter', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { some: "data"}, 
				filter: { PropName: 1 }
			});

			expect(value).to.equal('?$filter=PropName eq 1');
			expect(output).to.equal('next');
		});

		it('should return handle the simple filter parameters', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myProp: "myPropValue"}, 
				filter: { "PropName": "${myProp}" }
			});

			expect(value).to.equal('?$filter=PropName eq \'myPropValue\'');
			expect(output).to.equal('next');
		});

		it('should return handle the logical and filter parameters with startsWith', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myProp1: "myPropValue1", myProp2: "myPropValue2", myProp3: "myPropValue3"}, 
				filter: [{ "PropName1": "${myProp1}" },{ "PropName2": "${myProp2}" }, "startswith(myProp3, ${myProp3})" ]
			});

			expect(value).to.equal('?$filter=PropName1 eq \'myPropValue1\' and PropName2 eq \'myPropValue2\' and startswith(myProp3, myPropValue3)');
			expect(output).to.equal('next');
		});

		it('should double the single quote the filter value, if it contains a single quote', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myProp1: "myProp\'Value1", myProp2: "myProp\'Value2", myProp3: "myPropValue3"}, 
				filter: [{ "PropName1": "${myProp1}" },{ "PropName2": "${myProp2}" }, "startswith(myProp3, ${myProp3})" ]
			});

			expect(value).to.equal('?$filter=PropName1 eq \'myProp\'\'Value1\' and PropName2 eq \'myProp\'\'Value2\' and startswith(myProp3, myPropValue3)');
			expect(output).to.equal('next');
		});

		it('should return a filter based on data given in an array', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: {  cars: ["Saab", "Volvo", "BMW"] },
				filter: { "car": "${cars[1]}" }
			});

			expect(value).to.equal('?$filter=car eq \'Volvo\'');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery search tests', () => {
		it('should handle the search parameter using given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { mySearchProp1: "mySearchPropValue1"}, 
				search: 'api and ${mySearchProp1}'
			});

			expect(value).to.equal('?$search=api and mySearchPropValue1');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery select tests', () => {
		it('should handle the select parameter using given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { mySelectProp1: "mySelectPropValue1"}, 
				select: ['${mySelectProp1}', 'someFixed']
			});

			expect(value).to.equal('?$select=mySelectPropValue1,someFixed');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery ordering tests', () => {
		it('should handle the order parameter using given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myOrderProp1: "myOrderPropValue1"}, 
				orderBy: ['${myOrderProp1}', 'someFixedOrderProp']
			});

			expect(value).to.equal('?$orderby=myOrderPropValue1,someFixedOrderProp');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery expand tests', () => {
		it('should handle the expand parameter using given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myExpandProp1: "myExpandPropValue1"}, 
				expand: ['${myExpandProp1}', 'someFixedOrderProp']
			});

			expect(value).to.equal('?$expand=myExpandPropValue1,someFixedOrderProp');
			expect(output).to.equal('next');
		});

		it('should handle the expand parameter using given data and top 10', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myExpandProp1: "myExpandPropValue1", top10: 10}, 
				expand: ['${myExpandProp1}: { top: \'${top10}\'}']
			});

			expect(value).to.equal('?$expand=myExpandPropValue1: { top: \'10\'}');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery pagination tests', () => {
		it('should handle the top and skip parameters using given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { myTopProp1: 50, mySkipProp1: 250}, 
				top: '${myTopProp1}', 
				skip: '${mySkipProp1}'
			});

			expect(value).to.equal('?$top=50&$skip=250');
			expect(output).to.equal('next');
		});

		it('should handle the top and skip parameters with fixed numbers', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { }, 
				top: 15, 
				skip: 500
			});

			expect(value).to.equal('?$top=15&$skip=500');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery singleItem tests', () => {
		it('should handle the single item parameter using given data', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: { mySingleItem: 50}, 
				singleItem: '${mySingleItem}'
			});

			expect(value).to.equal('?$skip=50');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery count tests', () => {
		it('should handle the count parameter', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: {}, 
				count: "IncludeCount"
			});

			expect(value).to.equal('?$count=true');
			expect(output).to.equal('next');
		});

		it('should handle the count parameter as ReturnCount', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: {mySelectProp1: "selectValue"}, 
				filter: { prop1 : "value1"},
				select: ['${mySelectProp1}', 'someFixed'],
				count: "ReturnCount"
			});

			expect(value).to.equal('/$count?$select=selectValue,someFixed&$filter=prop1 eq \'value1\'');
			expect(output).to.equal('next');
		});
	});

	describe('#createQuery URL tests', () => {
		it('should return the URL plus OData-Query', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: {}, 
				filter: { PropName: 1 }, 
				url: 'https://services.odata.org/V4/TripPinServiceRW'
			});

			expect(value).to.equal('https://services.odata.org/V4/TripPinServiceRW?$filter=PropName eq 1');
			expect(output).to.equal('next');
		});

		it('should handle the count parameter as ReturnCount', async () => {
			const { value, output } = await flowNode.createQuery({ 
				data: {mySelectProp1: "selectValue"}, 
				filter: { prop1 : "value1"},
				select: ['${mySelectProp1}', 'someFixed'],
				count: "ReturnCount"
			});

			expect(value).to.equal('/$count?$select=selectValue,someFixed&$filter=prop1 eq \'value1\'');
			expect(output).to.equal('next');
		});
	});
});
