module.exports = {
	pluginConfig: {
		'api-builder-plugin-solace': {			
			url:      process.env.SOLACE_URL,
			vpnName:  process.env.SOLACE_VPN,
			userName: process.env.SOLACE_USER_NAME,
			password: process.env.SOLACE_PASSWORD
		}
	}
};
