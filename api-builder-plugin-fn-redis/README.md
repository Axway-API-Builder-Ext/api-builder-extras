![Redis Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/Redis%20Tests/badge.svg)

# API-Builder Redis Connector

Integrate [Redis](https://redis.io) into your [API-Builder flow][1] using this connector. 

## Configuration

Before you can make use of it in your flow you have to configure your Redis instance in your API-Builder project.

During installation a new config file has been automatically created which must be completed with your Redis instance. You can do that directly from within the API-Builder UI: Configuration --> redis.default.js and set the Redis Node & Port.
However, we recommend to setup your configuration in a [environmentalized][4] way keeping [sensitive information][5] away from the source-code repository.

## Redis
This Connector is based on the https://www.npmjs.com/package/redis project. It's a good starting point to understand Redis reading their supported [commands](https://redis.io/commands).

As of today, the flow node only supports the Get and Set methods.

## Set

The _Set_ method is used to store the given _value_ using the _key_ in Redis.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| key | string | y | They key of the object to store in Redis. |
| value | String or Date | y | The value to store with they key. If other types than String or Date are used they get converted into a String using JSON.stringify |

## Get

The _Get_ method tries to find an entry with the given _key_ from Redis

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| key | string | y | They key of the object to lookup in Redis. |

## Tests
The project is mocking a Redis instance to execute tests and validate parameters and responses are handled correclty.
And run the following command:  
`npm test`  
The tests are also automatically executed on every commit to this project.  

## Compatibility
Tested with Redis 5.0.8  
Requires API-Builder Independence or higher

## Changelog
See [Change-Log][6]

## Limitations/Caveats
Only Get & Set methods are currently supported
Authentication to the Redis instance is currently not supported

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

[6]: CHANGELOG.md