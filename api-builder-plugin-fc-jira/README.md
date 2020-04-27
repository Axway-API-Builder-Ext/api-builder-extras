[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/JIRA%20CP%20Connector%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions)

# API-Builder JIRA Cloud-Platform Connector

Use this connector to communicate with the [JIRA Cloud-Platform](https://www.atlassian.com/software/jira) and make it part of your API-Management platform. It is based on the JIRA Cloud-Platform API (https://developer.atlassian.com/cloud/jira/platform/rest/v2/)  

## Installation
To install it into you API-Builder project execute:
```npm
npm install @axway-api-builder-ext/jira-cp-connector --no-optional
```
To install a specific version please use:
```npm
npm install @axway-api-builder-ext/jira-cp-connector@1.0.0 --no-optional
```

This connector is using the Swagger-Flow node:  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/swagger_flow-node.html  


## Configuration
After restarting your API-Builder project you get the following connector:  
![JIRA Cloud Platform Connector][jira-connector]   
Depending on the selected method different options appear on the right, when using the connector as part of the flow.   
![JIRA Cloud Platform Connector Settings][jira-connector-settings]   

## Setup JIRA Cloud Platform Host and Login
A new config file has been automatically created for the JIRA Connector which can be used to setup the connection details:  
![JIRA Cloud Platform Connector Config][jira-connector-config]  
You need to create autentication credentials on JIRA. Learn more:  
https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/  

To learn and play around with the JIRA-REST API you may use:  
https://ffeathers.wordpress.com/tag/rest-api/

Additional details can be found here: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/swagger_flow-node.html#Swaggerflow-node-ConfiguretheSwaggerplugin  


Please note, that the connector is configured to use HTTP-Basic or OAuth to communicate with JIRA. In order to use that, please configure the Authentication-Credentials as described here:  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/http_basic_credentials.html  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/oauth_2_0_credentials.html  
Alternatively you can pass on externally given user-credentials with the flow node.

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
