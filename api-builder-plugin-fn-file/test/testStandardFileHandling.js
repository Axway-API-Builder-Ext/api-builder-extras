const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
const actions = require('../src/standardFileActions');

describe('Standard file handling test', () => {
	let plugin;
	let flowNode;
	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		flowNode = plugin.getFlowNode('file');
	});

	describe('#constructor', () => {
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
			expect(flowNode.getMethods()).to.include('writeFile');
		});

		it('should define valid flow-nodes', () => {
			// if this is invalid, it will throw and fail
			plugin.validate();
		});
	});

	describe('#Write Standard file - Error handling tests', () => {
		it('should error when file parameter is missng', async () => {
			const { value, output } = await flowNode.writeFile({
				filename: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filename');
			expect(output).to.equal('error');
        });
        
		it('should error when data parameter is missng', async () => {
			const { value, output } = await flowNode.writeFile({
				filename: 'AnyFileName', data: null
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: data');
			expect(output).to.equal('error');
        });

		it('should error when given filename is invalid', async () => {
			const { value, output } = await flowNode.writeFile({
				filename: '/////invalidFilename///', data: 'Some data to write'
			});

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Error writing file: /////invalidFilename///. Message: EPERM: operation not permitted, open \'/////invalidFilename///\'');
			expect(output).to.equal('error');
        });

		it('Write standard file with default UTF-8 encoding and compare result.', async () => {
            const testDir = tmp.dirSync({ prefix: 'builderFlowNodeFileTest_' });
            const testFile = getTestFilename('standardUTF8.txt')
            const inputData = fs.readFileSync('test/standardFiles/testFile1.txt', {encoding: 'utf-8'});
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');

            const outputData = fs.readFileSync(testFile, {encoding: 'utf-8'});

            expect(inputData).to.equal(outputData);
        });
        
		it('Write chinese UTF-8 encoded file and compare result.', async () => {
            const testDir = tmp.dirSync({ prefix: 'builderFlowNodeFileTest_' });
            const testFile = getTestFilename('chineseUTF8.txt')
            const inputData = fs.readFileSync('test/standardFiles/chineseUTF8.txt', {encoding: 'utf-8'});
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');

            const outputData = fs.readFileSync(testFile, {encoding: 'utf-8'});

            expect(inputData).to.equal(outputData);
        });
        
		it('Write UTF-16LE encoded file and compare result.', async () => {
            const testDir = tmp.dirSync({ prefix: 'builderFlowNodeFileTest_' });
            const testFile = getTestFilename('greekDataUTF16LE.txt')
            const inputData = fs.readFileSync('test/standardFiles/greekDataUTF16LE.txt', {encoding: 'utf16le'});
			const { value, output } = await flowNode.writeFile({ 
                filename: testFile, data: inputData, dataEncoding: 'utf16le'
                });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');

            const outputData = fs.readFileSync(testFile, {encoding: 'utf16le'});

            expect(inputData).to.equal(outputData);
        });
	});
});

function getTestFilename(filename) {
    const testDir = tmp.dirSync({ prefix: 'builderFlowNodeFileTest_' });
    const testFile = path.join(testDir.name, filename);
    return testFile;
}
