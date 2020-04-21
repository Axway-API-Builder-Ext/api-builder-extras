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

describe('SAP Landscape flow-node', () => {
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
			const flownode = runtime.getFlowNode('sap-lama-api');
			expect(flownode).to.be.a('object');

			// Ensure the flow-node matches the OAS document
			expect(flownode.name).to.equal('SAP Landscape Mgt.');
			expect(flownode.description).to.equal('SAP Landscape Management 3.0 API to used in the Axway API-Builder Connector.');
			expect(flownode.icon).to.be.a('string');
			expect(Object.keys(flownode.methods)).to.deep.equal([                
                'Get-XSRF-Token',
                'Cancel-Activity',
                'Continue-Activity',
                'Create-Activity',
                'Get-list-of-activities',
                'Get-Activity',
                'Delete-Activity',
                'Get-Activity-Step',
                'Get-Activity-Logs',
                'Get-Activity-Steps',
                'Hold-activity',
                'Release-Activity',
                'Retry-Activity',
                'Get-All-Appliances',
                'Get-appliance',
                'Trigger-Discovery',
                'Create-Host',
                'Get-Hosts',
                'Modify-Multiple-Hosts',
                'Get-Host-With-Name',
                'Delete-Host',
                'Update-Host',
                'Modify-Host',
                'Get-Host-Relations',
                'Get-Host-Validations',
                'Create-Instance',
                'Get-Instances',
                'Modify-Multiple-Instances',
                'Get-Instance',
                'Delete-Instance',
                'Update-Instance',
                'Modify-Instance',
                'Get-Instance-Relations',
                'Get-Instance-Validations',
                'Get-Logs',
                'Get-Log-with-Id',
                'Get-log-entries',
                'Get-Pools',
                'Modify-Multiple-Pools',
                'Create-Pool',
                'Get-Pool-With-Name',
                'Modify-Pool',
                'Update-Pool',
                'Delete-Pool',
                'Get-Pool-Childrens',
                'Get-Pool-Entities',
                'Get-Pool-Relations',
                'Search',
                'Create-System',
                'Get-Systems',
                'Update-Multiple-Systems',
                'Create-System-Instance',
                'Get-System-Instances',
                'Update-Multiple-Instances',
                'Get-System',
                'Delete-System',
                'Update-System',
                'Modify-System',
                'Get-System-Instance',
                'Delete-System-Instance',
                'Update-System-Instance',
                'Modify-System-Instance',
                'Get-System-Instance-Relations',
                'Get-System-Instance-Validations',
                'Get-System-Dependencies',
                'Update-Intersystem-dependencies',
                'Get-System-Relatations',
			]);
		});

		it('should define valid flow-nodes', () => {
			expect(runtime.validate()).to.not.throw;
		});
	});
});