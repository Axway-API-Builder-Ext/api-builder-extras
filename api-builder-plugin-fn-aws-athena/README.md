[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/AWS%20Athena%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions)

# API-Builder AWS-Athena Flow-Node

Amazon Athena is an interactive query service that makes it easy to analyze data in Amazon S3 using standard SQL. Athena is serverless, so there is no infrastructure to manage, and you pay only for the queries that you run.  
  
Athena is easy to use. Simply point to your data in Amazon S3, define the schema, and start querying using standard SQL.  

This module can be used to query a AWS Datasource as part of your [API-Builder flow][1] using AWS-Athena.  

## Configuration

Watch this video to get an overview how to install and configure the Axway API-Builder Connector:
[![Install AWS-Athena Connector](https://img.youtube.com/vi/AUIsxH33gow/0.jpg)](https://youtu.be/AUIsxH33gow)


After installation and restarting your API-Builder project you get the following connector:  
![Node][connector]   

A default configuration file has been generated under: conf/aws-athena.default.js in which you have to configured your AWS-Access-Key information.


## Changelog
See [Change-Log][6]


[1]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html
[2]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues
[6]: Changelog.md

[connector]: imgs/athena-flownode.png
[connector-query]: imgs/athena-query.png
