![AWS Lambda Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/AWS%20Lambda%20Tests/badge.svg)

# API-Builder AWS-Lambda Flow-Node

If you would like to integrate AWS Lambda functions into your [API-Builder flow][1] use this flow node.
It allows you to easily call your functions and with that, you can transform, merge and finally return the payload.

## Configuration

Watch this video to get an overview how to install and configure the Axway API-Builder Connector:
[![Install AWS-Athena Connector](https://img.youtube.com/vi/AUIsxH33gow/0.jpg)](https://youtu.be/AUIsxH33gow)


After installation and restarting your API-Builder project you get the following connector:  
![Node][connector]   

A default configuration file has been generated under: conf/aws-lambda.default.js in which you have to configured your AWS-Access-Key information.

[1]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html
[2]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues

[connector]: imgs/athena-flownode.png
[connector-query]: imgs/athena-query.png
