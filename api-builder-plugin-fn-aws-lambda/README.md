![AWS Lambda Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/AWS%20Lambda%20Tests/badge.svg)

# API-Builder AWS-Lambda Flow-Node

If you would like to integrate AWS Lambda functions into your [API-Builder flow][1] use this flow node.
It allows you to easily call your functions and with that, you can transform, merge and finally return the payload.

## Configuration

After installation and restarting your API-Builder project you get the following connector:  
![Syncplicity Node][connector]   
Depending on the selected method different options appear on the right, when using the connector as part of the flow.   
![Syncplicity Node Settings][connector-settings]   


After installation and restarting your API-Builder project you get the following connector:  
![Node][connector]   

A default configuration file has been generated under: conf/aws-lambda.default.js in which you have to configured your AWS-Access-Key information.

## Setup
A new config file has been automatically created for the AWS Lambda Flow-Node which must be configured with your AWS Credentials:  
![Syncplicity Node Settings][connector-config]  
Additional details can be found here: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/swagger_flow-node.html#Swaggerflow-node-ConfiguretheSwaggerplugin  


Please note, that the connector is configured to use OAuth 2.0 to communicate with Syncplicuty. In order to use that, please configure the Authentication-Credentials as described here:  
https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/oauth_2_0_credentials.html  

:exclamation: Please make sure to add basic_auth:true as part of the credential configuration.  

## Compatibility
Tested with AWS Lambda Q1/2020  
Requires API-Builder Independence or higher

## Changelog
- 1.0.0 - 18.02.2020
  - Initial version

## Limitations/Caveats
Noting known

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"

[1]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html
[2]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues

[connector]: imgs/lambda-flownode.png
[connector-query]: imgs/lambda-invoke.png
