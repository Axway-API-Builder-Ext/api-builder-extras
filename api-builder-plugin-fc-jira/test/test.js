const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');

const getPlugin = require('../index');

describe('Jira flow-node', () => {
	let plugin;
	let flowNode;
	before(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin);
		flowNode = plugin.getFlowNode('jira-cp-connector');
	});
	describe('#constructor', () => {
		it('should define flow-nodes', () => {
			expect(plugin).to.exist;
			expect(flowNode).to.be.a('object');

			// Ensure the flow-node matches the OAS document
			expect(flowNode.name).to.equal('JIRA Cloud Platform API');
			expect(flowNode.description).to.equal('JIRA 8.4.3');
			expect(flowNode.icon).to.be.a('string');
			expect(Object.keys(flowNode.methods)).to.deep.equal([                
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
			plugin.validate();
		});
	});
});