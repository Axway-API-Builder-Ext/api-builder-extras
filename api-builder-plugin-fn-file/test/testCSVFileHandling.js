const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../src');
const actions = require('../src/csvFileActions');

describe('flow-node file', () => {
	let runtime;
	before(async () => runtime = new MockRuntime(await getPlugin()));

	describe('Flow configuration', () => {
		it('should define flow-nodes', () => {
			expect(actions).to.be.an('object');
			expect(actions.readCVSFile).to.be.a('function');
			expect(runtime).to.exist;
			const flownode = runtime.getFlowNode('file');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the spec
			expect(flownode.name).to.equal('File');
			expect(flownode.description).to.equal('Flow node to read and write files');
			expect(flownode.icon).to.be.a('string');
		});

		// It is vital to ensure that the generated node flow-nodes are valid
		// for use in API Builder. Your unit tests should always include this
		// validation to avoid potential issues when API Builder loads your
		// node.
		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});

	describe('Check proper parameter validation', () => {
		it('Missing filename', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');

			const result = await flowNode.readCVSFile({
				filename: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filename');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filename');
		});

		it('filterColumn without a filterValue', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');

			const result = await flowNode.readCVSFile({
				filename: "/my/file", filterColumn: "columnA", filterValues: null
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'You need to provide a filterValues when using filterColumn');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'You need to provide a filterValues when using filterColumn');
		});

		it('filterValues without a filterColumn', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');

			const result = await flowNode.readCVSFile({
				filename: "/my/file", filterColumn: null, filterValues: "Axway"
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'You need to provide a filterColumn when using filterValues');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'You need to provide a filterColumn when using filterValues');
		});

		it('Not existing file (relativly to API-Builder App-Directory)', async () => {
			const flowNode = runtime.getFlowNode('file');

			const result = await flowNode.readCVSFile({ filename: 'test/csv/fileDoesNotExists.csv' });

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('error');
			expect(result.args[0]).to.equal(null);
			expect(result.args[1]).to.be.instanceOf(Error)
				.and.to.have.property('message', 'File: test/csv/fileDoesNotExists.csv not found.');
			expect(result.context).to.be.an('Object');
			expect(result.context.error).instanceOf(Error)
				.and.to.have.property('message', 'File: test/csv/fileDoesNotExists.csv not found.');
		});
	});

	describe('Check with valid configurations', () => {
		it('Default parameters for all', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'},
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			});
		});

		it('Filter for specific resultColumns', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv', resultColumns: ['ReturnCode', 'Author']
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '401', Author: 'Chris'},
					{ReturnCode: '500', Author: 'Charles'}
				]
			});
		});

		it('Filter for specific value in a column', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv', filterColumn: 'ReturnCode', filterValues: "500"
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			});
		});

		it('Filter for multiple values in a column', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes.csv', filterColumn: 'ReturnCode', filterValues: ["500", "401"]
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'},
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			});
		});

		it('Using delimiter pipe', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes-Delim-Pipe.csv', delimiter: '|', filterColumn: 'ReturnCode', filterValues: '500'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			});
		});

		it('Check CSV-File with comment', async () => {
			// Invoke #hello with a non-number and check error.
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes-with-Comment.csv', comment: '#', filterColumn: 'ReturnCode', filterValues: '500'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'}
				]
			});
		});

		it('Test Quote instruction works', async () => {
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Having-Quoted-Field.csv', quote: '%', filterColumn: 'ReturnCode', filterValues: '401'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '401', ResponseMessage: 'You have no permission, go axway', LastUpdate: '16.01.2020', Author: 'Chris'}
				]
			});
		});

		it('Test relax_column_count option', async () => {
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Inconsistent-ColumnCounts.csv', relax_column_count: true
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'},
					{ReturnCode: '500', ResponseMessage: 'Internal server error', LastUpdate: '17.01.2020', Author: 'Charles'},
					{ReturnCode: '402', ResponseMessage: 'This entry is invalid', LastUpdate: '21.01.2020'}
				]
			});
		});

		it('Test a CSV without having a header', async () => {
			const flowNode = runtime.getFlowNode('file');
			const result = await flowNode.readCVSFile({
				filename: 'test/csv/CSV-Return-Codes-No-Header.csv', columns: ['ReturnCode', 'ResponseMessage', 'LastUpdate', 'Author'], filterColumn: 'ReturnCode', filterValues: '401'
			});

			expect(result.callCount).to.equal(1);
			expect(result.output).to.equal('next');
			expect(result.context).to.deep.equal({
				content: [
					{ReturnCode: '401', ResponseMessage: 'You have no permission', LastUpdate: '16.01.2020', Author: 'Chris'}
				]
			});
		});


	});
});
