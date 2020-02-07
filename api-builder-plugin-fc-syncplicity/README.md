# API-Builder Syncplicity Connector

Use this connector to communicate with the [Syncplicity by Axway](https://www.syncplicity.com/en) and make it part of your API-Management platform.  

## Installation
To install it into you API-Builder project execute:
```npm
npm install @axway-api-builder-ext/syncplicity-connector --no-optional
```
To install a specific version please use:
```npm
npm install @axway-api-builder-ext/syncplicity-connector@1.0.0 --no-optional
```

This connector is using the Swagger-Flow node:  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/swagger_flow-node.html  


## Configuration

Watch this video to get an overview how to install and configure the Axway API-Builder Connector:
[![Install Syncplicity Connector](https://img.youtube.com/vi/OpKLVtjnQnU/0.jpg)](https://youtu.be/OpKLVtjnQnU)


After restarting your API-Builder project you get the following connector:  
![Syncplicity Node][connector]   
Depending on the selected method different options appear on the right, when using the connector as part of the flow.   
![Syncplicity Node Settings][connector-settings]   

## Setup Syncplicity connector
A new config file has been automatically created for the Syncplicity Connector which can be used to setup the connection details:  
![Syncplicity Node Settings][connector-config]  
Additional details can be found here: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/swagger_flow-node.html#Swaggerflow-node-ConfiguretheSwaggerplugin  


Please note, that the connector is configured to use OAuth 2.0 to communicate with Syncplicuty. In order to use that, please configure the Authentication-Credentials as described here:  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/oauth_2_0_credentials.html  

:exclamation: Please make sure to add basic_auth:true as part of the credential configuration.  

```javascript
module.exports = {
	// The configuration settings for your Swagger service.
	pluginConfig: {
		'@axway/api-builder-plugin-fn-swagger': {
			'syncplicity': {
				// It is possible to override Swagger URI options when constructing
				// outbound requests from the Swagger plugin.
				uri: {
					// protocol: 'https',
					// host: 'hostname',
					// port: 443,
					// basePath: '/api'
				}
			}
		}
	},
	// The following authorization credentials needed to use the Swagger service.
	// Please follow this guide to manually configure the credentials:
	// https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_credentials.html
	authorization: {
		credentials: {
			'Syncplicity oauth': {
				type: 'oauth2',
				flow: 'accessCode',
				basic_auth: true, 
				authentication_url: 'https://api.syncplicity.com/oauth/authorize',
				token_url: 'https://api.syncplicity.com/oauth/token',
				scope: 'readwrite read',
				client_id: 'YOUR_CLIENT_ID_GOES_HERE',
				client_secret: 'YOUR_SECRET_GOES_HERE',
				access_token: null,
				refresh_token: null
			}
		}
	}
};
```

## Compatibility
Tested with Syncplicity version Q1/2020

## Changelog
- 1.0.0 - 02.02.2020
  - Initial version

## Limitations/Caveats
- __Not required anymore with release: Independence__  
  OAuth doesn't work with API-Builder - Will be fixed with release 16.02.20
  Adjust the following to make it work  
	In node_modules\@axway\axway-flow-authorization\src\handlers\oauth2.js  
	In function oauthRequest add an HTTP-Basic Authorization header (headers) based on client-id & secret  
	Example:  
	'Authorization': 'Basic YWQ0ODA1YWUtZ........Y2JlOGQ0OTI5YQ=='

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  


## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"


## License
[Apache License 2.0](/LICENSE)

[connector]: misc/images/Syncplicity-Connector.png
[connector-settings]: misc/images/Syncplicity-Connector-Settings.png
[connector-config]: misc/images/Syncplicity-Connector-Config.png
