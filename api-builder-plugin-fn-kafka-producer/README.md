![Kafka Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/Kafka%20Producer%20Tests/badge.svg)

# API-Builder Kafka Producer

This plugin allows you to publish messages on Kafka topics from your [API-Builder flows][1].

## Configuration

Before you can make use of it in your flow you have to configure your Kafka instance in your API-Builder project.

During installation of this plugin a new config file has been automatically created which must be completed with your Kafka configuration details. You can do that directly from within the API-Builder UI:

* Open `Configuration` tab
* Select `kafka-producer.default.js`
* Set values for `brokers` and `clientId` (the other values have defaults that you can leave to get started quickly)

However, we recommend to setup your configuration in a [environmentalized][4] way keeping [sensitive information][5] away from the source-code repository.

## Kafka
This Connector is built using the [Kafkajs project][https://kafka.js.org]. It's a good starting point to understand how this connector works. The flow node does not yet support all of the features offered by this connector for publishing messages onto Kafka topics.

## publish

The _publish_ method is used to push messages onto Kafka topics.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| messageObjects | Array | n | This allows you to build the messages you want to send to your own specifications as per the kafkajs spec. Using this will mean that all other parameters are ignored. |
| topic | string | n | The topic to send your messages to. Mandatory if there is no messageObject array |
| messages | String or Array | n | Either a string (single message) or an array of strings. Mandatory if there is no messageObject array |
| key | string | n | You can optionally add a key with your messages. This allows you to associate messages together and keep them in the same partition. |
| partition | number | n | You can optionally choose a specific partition for the key you supplied |


## Compatibility
Tested with Kafka 2.5.0 
Requires API-Builder [Oslo][6] or higher

## Changelog
See [Change-Log][7]

## Limitations/Caveats
Consume functionality will be handled in another way by API Builder in the future. Batch sends are not currently supported.
This plugin can support any authentication scheme supported by Kafkajs.

If you require an unsupported API or authentication don't hestitate to create an [issue][3]

## Contributing

Please [read this guide](https://github.com/Axway-API-Builder-Ext/api-builder-extras/blob/master/api-builder-plugin-fn-kafka-producer/DEVELOPMENT.md) for details on how to contribute to this flow-node.

Please [read this guide](https://github.com/Axway-API-Builder-Ext/api-builder-extras/blob/master/README.md) for details on how to develop and share a plugin, our code of conduct, and the process for submitting pull requests to us.

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"

[1]: https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/flows/index.html
[2]: https://docs.axway.com/bundle/api-builder/page/docs/getting_started/index.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues
[4]: https://docs.axway.com/bundle/api-builder/page/docs/security_guide/index.html#environmentalization
[5]: https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/project/configuration/project_configuration/index.html#configuration-files
[6]: https://docs.axway.com/bundle/api-builder/page/docs/release_notes/oslo/index.html

[7]: CHANGELOG.md
