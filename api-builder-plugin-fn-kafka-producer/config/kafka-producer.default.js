module.exports = {
	pluginConfig: {
		// During development you may set the environment variables in conf/.env
		// More info at: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/environmentalization.html
		'api-builder-plugin-kafka-producer': {
			clientConfiguration: {
				clientId: '', // Identify your client here
				brokers: [], // For each broker, add a host and port here (e.g. 10.0.0.1:9092)
				connectTimeout: 3000, // in ms, time it takes to wait for a successful connection before moving to the next host
				retry: {
					initialRetryTime: 100,
					retries: 8
				},
				//
				// SSL example
				//
				// ssl: {
				// 	rejectUnauthorized: false,
				// 	ca: [fs.readFileSync('/my/custom/ca.crt', 'utf-8')],
				// 	key: fs.readFileSync('/my/custom/client-key.pem', 'utf-8'),
				// 	cert: fs.readFileSync('/my/custom/client-cert.pem', 'utf-8')
				// },
				//
				// PLAIN / SCRAM example
				//
				// ssl: true,
				// sasl: {
				// 	mechanism: 'plain', // scram-sha-256 or scram-sha-512
				// 	username: 'my-username',
				// 	password: 'my-password'
				// },
				//
				// An example for AWS IAM
				//
				// sasl: {
				// 	mechanism: 'aws',
				// 	authorizationIdentity: 'AIDAIOSFODNN7EXAMPLE', // UserId or RoleId
				// 	accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
				// 	secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
				// 	sessionToken: 'WHArYt8i5vfQUrIU5ZbMLCbjcAiv/Eww6eL9tgQMJp6QFNEXAMPLETOKEN' // Optional
				// },
			},
			producerConfiguration: {
				transactionTimeout: 60000, // The amount of time in milliseconds to wait for all acks before considered
			}			
		}
	}
};