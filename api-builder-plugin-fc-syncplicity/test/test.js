const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-sdk');

const getPlugin = require('../index');

function getLogger () {
	const logger = {
		debug: () => {},
		trace: () => {},
		info: () => {},
		warn: () => {},
		error: () => {},
		fatal: () => {}
	};
	logger.scope = () => logger;
	return logger;
}

describe('Syncplicity flow-node', () => {
	let runtime;
	before(async () => {
		const plugin = await getPlugin({}, {
			logger: getLogger()
		});
		runtime = new MockRuntime(plugin);
	});

	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(runtime).to.exist;
			// Ensure there's a flow-node and schemas created for each OAS document
            expect(Object.keys(runtime.plugin.flownodes)).to.have.length(1);
			const flownode = runtime.getFlowNode('syncplicity');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the OAS document
			expect(flownode.name).to.equal('Syncplicity');
			expect(flownode.description).to.equal('Syncplicity Connector based on API-Version 1.1');
			expect(flownode.icon).to.be.a('string');
			expect(Object.keys(flownode.methods)).to.deep.equal([
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
			expect(runtime.validate()).to.not.throw;
		});
	});
});