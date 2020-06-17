const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');

const getPlugin = require('../index');

describe('Syncplicity flow-node', () => {
	let plugin;
	let flowNode;
	before(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		flowNode = plugin.getFlowNode('syncplicity');
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.exist;
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the OAS document
			expect(flowNode.name).to.equal('Syncplicity');
			expect(flowNode.description).to.equal('Syncplicity Connector based on API-Version 1.1');
			expect(flowNode.icon).to.be.a('string');
			expect(Object.keys(flowNode.methods)).to.deep.equal([
                'Company GET',
                'Users POST',
                'Users PUT',
                'Users GET',
                'User GET',
                'User PUT',
                'User DELETE',
                'Machine GET',
                'Machines GET',
                'Machines POST',
                'Groups GET',
                'Groups CREATE',
                'User groups GET',
                'Group PUT',
                'Group DELETE',
                'Group members GET',
                'Group members POST',
                'Group member GET',
                'Group member DELETE',
                'Policyset GET',
                'Policyset PUT',
                'Policyset DELETE',
                'Policysets GET',
                'Policysets POST',
                'Policysets DELETE',
                'Policysets by company GET',
                'Folders from Folder GET',
                'Folders to Folder POST',
                'Folders from Folder DELETE',
                'Folder GET',
                'Folder DELETE',
                'Files GET',
                'File by Id GET',
                'File by Id DELETE',
                'Files from Syncpoint DELETE',
                'File versions GET',
                'File version DELETE',
                'Folders from Syncpoint GET',
                'Folders to syncpoint POST',
                'Syncpoints GET',
                'Syncpoints POST',
                'Syncpoint GET',
                'Syncpoint PUT',
                'Syncpoint DELETE',
                'Syncpoint Participants GET',
                'Syncpoint Participants POST',
                'Syncpoint Participants DELETE',
                'Links GET',
                'Links POST',
                'Link GET',
                'Link PUT',
                'Link DELETE',
                'Syncpoint Participant DELETE',
                'Storage Endpoints GET',
                'Default Storage Endpoint GET',
                'Storage Endpoint GET'
			]);
		});

		it('should define valid flow-nodes', () => {
			plugin.validate();
		});
	});
});