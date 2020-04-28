[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/JIRA%20CP%20Connector%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions)

# API-Builder JIRA Cloud-Platform Connector

Use this connector to communicate with the [JIRA Cloud-Platform](https://www.atlassian.com/software/jira) and make it part of your API-Management platform. It is based on the JIRA Cloud-Platform API (https://developer.atlassian.com/cloud/jira/platform/rest/v2/) and works On-Premise or with the Cloud-Instance.  

## Configuration
After installing and restarting your API-Builder project you get the following connector:  
![JIRA Cloud Platform Connector][jira-connector]   
Which can be used to communicate with your JIRA-Instance to Create, Update issues. 

### Setup JIRA Cloud Platform Host and Login
In order to use the plugin you need to configure your JIRA-Account details in the configuration file: `jira-jira-cp-connector.default.js`.  
We recommend to setup your configuration in a [environmentalized](https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/environmentalization.html) way keeping [sensitive information](https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/project_configuration.html#ProjectConfiguration-Configurationfiles) away from the source-code repository.. 
```javascript
module.exports = {
	// The configuration settings for the OAS2 flow-node: JIRA Cloud Platform API
	pluginConfig: {
		'@axway-api-builder-ext/api-builder-plugin-fc-jira': {
			'jira-cp-connector': {
				// It is possible to override URI options when constructing
				// outbound requests to this service.
				uri: {
					// protocol: 'https',
					// host: 'hostname',
					// port: 443,
					// basePath: '/api'
				}
			}
		}
	},
	// The following authorization credentials needed to use this service.
	// Please follow this guide to manually configure these credentials:
	// https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_credentials.html
	authorization: {
		credentials: {
			'JIRA Cloud Platform API HTTP Basic Authentication': {
				type: 'basic',
				username: null,
				password: null
			}
		}
	}
};
```
### Get JIRA Authentication credentials
At the moment the plugin only supports HTTP-Basic based authentication. How to obtain the required API-Token you can read in the official documentation:  
https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/  
Details how to setup the HTTP-Basic credentials in API-Builder:  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/http_basic_credentials.html

Once the configuration is complete, the JIRA flow can be used.

## Usage

The JIRA-Connector is based on the JIRA [REST-API](https://developer.atlassian.com/cloud/jira/platform/rest/v2/), hence understanding how the API works is a good start. You may install and use the [Atlassian Developer Toolbox](https://marketplace.atlassian.com/apps/1014904/atlassian-developer-toolbox) to learn the how the REST-API works.  

A general recommendation during development / integration is to create entities likes issues in JIRA using the UI and read them to understand the structure.  

## Examples
### Create issue
```

```

## Troubleshot
### Error: 403 Basic auth with password is not allowed on this instance
This error message is a bit misleading, as HTTP-Basic Auth still works, but you have to use an API-Token instead of your passwrd. Please double check you are using a valid API-Token. This error message appears, when the authentication fails using basic auth.


## Compatibility
Tested with JIRA Cloud Platform 8.5.1

## Changelog
See [Change-Log][6]

## Limitations/Caveats
- Currently support for JIRA-Issues only

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  


## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"


## License
[Apache License 2.0](/LICENSE)

[jira-connector]: misc/images/JIRA-CP-Connector.png
[jira-connector-config]: misc/images/JIRA-CP-Connector-Config.png
[jira-connector-settings]: misc/images/JIRA-CP-Connector-Settings.png

[6]: Changelog.md
