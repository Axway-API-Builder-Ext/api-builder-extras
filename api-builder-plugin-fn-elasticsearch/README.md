![Elasticsearch Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/Elasticsearch%20Tests/badge.svg)

# API-Builder Elasticsearch Connector

Integrate Elasticsearch information into your [API-Builder flow][1] using this connector. 

## Configuration

After installation and restarting your API-Builder project you get the following new flow-nodes:  
![Node][img1]   
Before you can make use it in your flow you have to configure your Elasticsearch instance in your API-Builder project.

During installation a new config file has been automatically created which must be completed with your Elasticsearch instance. You can do that directly from within the API-Builder UI:  
![Config][img3]  
We recommend to setup your configuration in a [environmentalized][4] way keeping [sensitive information][5] away from the source-code repository.

## Elasticsearch
This Connector is based on the https://www.elastic.co/blog/new-elasticsearch-javascript-client-released project. It's a good starting point to understand the APIs and their parameters reading the following documentation:   

- [Introduction](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/introduction.html)

As of today, the flow node only supports the [search API](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/api-reference.html#_search).

## Tests
The project is mocking an Elastic-Search instance to execute tests and validate parameters and responses are handled correclty.
And run the following command:  
`npm test`  
The tests are also automatically executed on every commit to this project.  

## Compatibility
Tested with Elasticsearch 7.4.0  
Requires API-Builder Independence or higher

## Changelog
See [Change-Log][CHANGELOG.md]

## Limitations/Caveats
Only the search API is currently supported
Authentication to the Elasticsearch instance is currently not supported

If you require on the of the unsupported APIs or authentication don't hestitate to create an [issue][3]

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"

[1]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html
[2]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues
[4]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/environmentalization.html
[5]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/project_configuration.html#ProjectConfiguration-Configurationfiles
[6]: https://console.cloud.google.com
[7]: https://developers.google.com/maps/documentation/javascript/get-api-key

[img1]: imgs/flow-node-elasticsearch.png
[img3]: imgs/elasticsearch-config.png
