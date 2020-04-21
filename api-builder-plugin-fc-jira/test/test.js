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

describe('Jira flow-node', () => {
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
			const flownode = runtime.getFlowNode('jira-cp-connector');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the OAS document
			expect(flownode.name).to.equal('JIRA Cloud Platform API');
			expect(flownode.description).to.equal('JIRA 8.4.3');
			expect(flownode.icon).to.be.a('string');
			expect(Object.keys(flownode.methods)).to.deep.equal([                
                'Create-Issue',
                'Create-Issues',
                'Issue-Get',
                'Issue-Delete',
                'Issue-Edit',
                'Issue-Archive',
                'Issue-Assign',
                'Issue-Get-Comments',
                'Issue-Add-Comment',
                'Issue-Get-Comment',
                'Issue-Update-Comment',
                'Issue-Delete-Comment',
                'Issue-Get-Metadata',
                'Issue-Send-Notification',
                'Issue-Get-RemoteLinks',
                'Issue-Update-RemoteLink',
                'Issue-Delete-RemoteLink',
                'Issue-Get-RemoteLinks-LinkId',
                'Issue-Update-RemoteLink-LinkId',
                'Issue-Delete-RemoteLink-LinkId',
                'Issue-Restore',
                'Issue-Get-Transitions',
                'Issue-Do-Transition',
                'Issue-Vote-Remove',
                'Issue-Vote-Add',
                'Issue-Votes-Get',
                'Issue-Watchers-Get',
                'Issue-Watchers-Add',
                'Issue-Watcher-Remove',
                'Issue-Worklogs-Get',
                'Issue-Worklog-Add',
                'Issue-Worklog-Get',
                'Issue-Worklog-Update',
                'deleteIssueWorklogByIssueIdOrKeyId',
                'Issue-Archive-List',
                'Issue-MetaData-Get'
			]);
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});
});