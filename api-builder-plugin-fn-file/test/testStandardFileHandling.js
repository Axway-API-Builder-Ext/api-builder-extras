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

	describe('#Write Standard file tests', () => {
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
                .and.to.have.property('message');
            expect(value.message).to.match(/.*Error writing file.*invalidFilename.*/)
			expect(output).to.equal('error');
        });

		it('Write standard file with default UTF-8 encoding and compare result.', async () => {
            const testFile = getTestFilename('standardUTF8.txt')
            const inputData = fs.readFileSync('test/standardFiles/testFile1.txt', {encoding: 'utf-8'});
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');

            const outputData = fs.readFileSync(testFile, {encoding: 'utf-8'});

            expect(inputData).to.equal(outputData);
        });
        
		it('Write chinese UTF-8 encoded file and compare result.', async () => {
            const testFile = getTestFilename('chineseUTF8.txt')
            const inputData = fs.readFileSync('test/standardFiles/chineseUTF8.txt', {encoding: 'utf-8'});
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');

            const outputData = fs.readFileSync(testFile, {encoding: 'utf-8'});

            expect(inputData).to.equal(outputData);
        });
        
		it('Write UTF-16LE encoded file and compare result.', async () => {
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
		
		it('JS-Object should be STORED as JSON', async () => {
            const testFile = getTestFilename('objectWrittenAsJSON.txt')
            const inputData =  {testKey1: 'testData1', testKey2: 'testData2'}
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');
            const outputData = fs.readFileSync(testFile, {encoding: 'utf8'});
            expect('{"testKey1":"testData1","testKey2":"testData2"}').to.equal(outputData);
		});
		
		it('JS-Object should STAY JS-Object', async () => {
            const testFile = getTestFilename('objectWrittenAsJSON.txt')
            const inputData =  {testKey1: 'testData1', testKey2: 'testData2'}
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData, stringify: false });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');
            const outputData = fs.readFileSync(testFile, {encoding: 'utf8'});
            expect('[object Object]').to.equal(outputData);
		});
		
		it('Make sure file is not overwritten', async () => {
			const testFile = getTestFilename('objectWrittenAsJSON.txt');
			fs.writeFileSync(testFile, 'Some data');
            const inputData =  {testKey1: 'testData1', testKey2: 'testData2'}
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData,  });

			expect(value).to.be.instanceOf(Error)
                .and.to.have.property('message');
            expect(value.message).to.match(/.*Error writing file.*file already exists.*/)
			expect(output).to.equal('error');
		});
		
		it('Overwrite option is turned on', async () => {
			const testFile = getTestFilename('objectWrittenAsJSON.txt');
			fs.writeFileSync(testFile, 'Some data');
            const inputData =  {testKey1: 'testData1', testKey2: 'testData2'}
			const { value, output } = await flowNode.writeFile({ filename: testFile, data: inputData, overwrite: true });

			expect(value).to.equal(testFile);
            expect(output).to.equal('next');
            const outputData = fs.readFileSync(testFile, {encoding: 'utf8'});
            expect('{"testKey1":"testData1","testKey2":"testData2"}').to.equal(outputData);
        });
	});

	describe('#Read Standard file tests', () => {
		it('should error when file parameter is missng', async () => {
			const { value, output } = await flowNode.readFile({ });

			expect(value).to.be.instanceOf(Error)
				.and.to.have.property('message', 'Missing required parameter: filename');
			expect(output).to.equal('error');
		});

		it('should fail with an unknown file when it should be treated as an error', async () => {
			const { value, output } = await flowNode.readFile({ filename: 'UnknownFile', notFoundFails: true });

			expect(value.message).to.match(/.*Error reading file: UnknownFile.*/)
			expect(output).to.equal('error');
		});

		it('should NOT fail with an unknown file when it should be treated as an error', async () => {
			const { value, output } = await flowNode.readFile({ filename: 'UnknownFile' });

			expect(output).to.equal('notFound');
			expect(value).to.match(/.*File: UnknownFile not found.*/)
		});

		it('should read a standard file as normal text', async () => {
			const testFile = getTestFilename('testFile.txt');
			fs.writeFileSync(testFile, 'Some data');
			const { value, output } = await flowNode.readFile({ filename: testFile });

			expect(output).to.equal('next');
			expect(value).to.equal('Some data');
		});

		it('should read a JSON file not parsing it.', async () => {
			const testData = fs.readFileSync('test/standardFiles/JSON-File.json', {encoding: 'utf8'});
			const { value, output } = await flowNode.readFile({ filename: 'test/standardFiles/JSON-File.json' });

			expect(output).to.equal('next');
			expect(value).to.equal(testData);
		});

		it('should read a JSON file parsed into JSON / JS-Object.', async () => {
			const testData = JSON.parse(fs.readFileSync('test/standardFiles/JSON-File.json', {encoding: 'utf8'}));
			const { value, output } = await flowNode.readFile({ 
				filename: 'test/standardFiles/JSON-File.json', 
				parseJson: true
			});

			expect(output).to.equal('next');
			expect(value).to.deep.equal(testData);
		});

		it('should read a UTF16LE encoded file', async () => {
			const testData = fs.readFileSync('test/standardFiles/greekDataUTF16LE.txt', {encoding: 'utf16le'});
			const { value, output } = await flowNode.readFile({ 
				filename: 'test/standardFiles/greekDataUTF16LE.txt', 
				encoding: 'utf16le'
			});

			expect(output).to.equal('next');
			expect(value).to.deep.equal(testData);
		});
	});
});

function getTestFilename(filename) {
    const testDir = tmp.dirSync({ prefix: 'builderFlowNodeFileTest_' });
    const testFile = path.join(testDir.name, filename);
    return testFile;
}
