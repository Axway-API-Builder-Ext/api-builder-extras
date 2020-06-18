const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');
const actions = require('../src/csvFileActions');

describe('flow-node file', () => {
	let runtime;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		flowNode = plugin.getFlowNode('file');
	});

	describe('Flow configuration', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.be.a('object');
			expect(plugin.getFlowNodeIds()).to.deep.equal([
				'file'
			]);
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flowNode.name).to.equal('File');
			expect(flowNode.description).to.equal('Flow node to read and write files');
			expect(flowNode.icon).to.be.a('string');
			expect(flowNode.getMethods()).to.deep.equal([
				'readCVSFile'
			]);
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			plugin.validate();
		});
	});

	describe('Check proper parameter validation', () => {
		it('Missing filename', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filename');
			expect(output).to.equal('error');
		});

		it('filterColumn without a filterValue', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: "/my/file", filterColumn: "columnA", filterValues: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'You need to provide a filterValues when using filterColumn');
			expect(output).to.equal('error');
		});

		it('filterValues without a filterColumn', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: "/my/file", filterColumn: null, filterValues: "Axway"
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'You need to provide a filterColumn when using filterValues');
			expect(output).to.equal('error');
		});

		it('Filter Non-Existing entry', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: "test/csv/CSV-Return-Codes.csv", filterColumn: null, filterValues: "DoesntExists", filterColumn: 'ReturnCode', uniqueResult: true
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'No entry found in CSV-File: test/csv/CSV-Return-Codes.csv using filterValues: DoesntExists using filterColumn: ReturnCode');
			expect(output).to.equal('error');
		});

		it('Not existing file (relativly to API-Builder App-Directory)', async () => {
			const { value, output } = await flowNode.readCVSFile({ filename: 'test/csv/fileDoesNotExists.csv' });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'File: test/csv/fileDoesNotExists.csv not found.');
			expect(output).to.equal('error');
		});

		it('Trying to a load an invalid CSV-File', async () => {
			const { value, output } = await flowNode.readCVSFile({ filename: 'test/csv/Incorrect-Format.csv' });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'No entry found in CSV-File: test/csv/Incorrect-Format.csv');
			expect(output).to.equal('error');
		});
	});

	describe('Check with valid configurations', () => {
		it('Default parameters for all', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv'
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'},
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			);
			
		});

		it('Filter for specific resultColumns', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv', resultColumns: ['ReturnCode', 'Author']
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '401', Author: 'Chris'},
					{ReturnCode: '500', Author: 'Charles'}
				]
			);
		});

		it('Filter for specific value in a column', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv', filterColumn: 'ReturnCode', filterValues: "500"
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			);
		});

		it('Filter for multiple values in a column', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv', filterColumn: 'ReturnCode', filterValues: ["500", "401"]
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'},
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			);
		});

		it('Using delimiter pipe', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes-Delim-Pipe.csv', delimiter: '|', filterColumn: 'ReturnCode', filterValues: '500'
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			);
		});

		it('Check CSV-File with comment', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes-with-Comment.csv', comment: '#', filterColumn: 'ReturnCode', filterValues: '500'
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			);
		});

		it('Test Quote instruction works', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Having-Quoted-Field.csv', quote: '%', filterColumn: 'ReturnCode', filterValues: '401'
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '401', ResponseMessage: 'You have no permission, go axway', LastUpdate: '16.01.2020', Author: 'Chris'}
				]
			);
		});

		it('Test relax_column_count option', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Inconsistent-ColumnCounts.csv', relax_column_count: true
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'},
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'},
					{ReturnCode: '402', ResponseMessage: 'This entry is invalid', LastUpdate: '21.01.2020'}
				]
			);
		});

		it('Test a CSV without having a header', async () => {
			const { value, output } = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes-No-Header.csv', columns: ['ReturnCode', 'ResponseMessage', 'LastUpdate', 'Author'], filterColumn: 'ReturnCode', filterValues: '401'
			});
			expect(output).to.equal('next');
			expect(value).to.deep.equal(
				[
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'}
				]
			);
		});


	});
});
