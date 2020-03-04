# PostgreSQL Connector

The PostgreSQL data connector is a plugin for API Builder that can connect to your PostgreSQL database instance and interrogate your schema that will automatically provision Models into to your project, and optionally, automatically generate a rich CRUD API to the underlying tables.  The Models can be used programmatically, or can be used within the flow editor to interact with your database.

## Minimum requirements

### Supported versions
* PostgreSQL 9.6
* Other versions might be supported as well, please create an [issue][3] if encounter any.

### Memory
* ~7 MB

### Disk space
* ~10 MB

### Supported features
* Automatic generation of Models from SQL tables
* Automatic generation of API for Models
* Full CRUD operations on tables via Models
* Connection pooling

## Installation

```bash
npm install --no-optional @axway/api-builder-plugin-dc-postgres
```

A configuration file is generated for you and placed into the conf directory of your API Builder project. The configuration for your PostgreSQL is expected to be in environment variables or in the conf/.env file during development. 

## Configuration

Once the plugin is installed, the configuration file is located `<project>/conf/postgres.default.js`.

| Option name | Type | Description |
| ----------- | ---- | ----------- |
| connector   | string | Must be: `@axway/api-builder-plugin-dc-postgres` |
| connectionPooling | boolean | boolean Enables connection pooling for better performance and scalability. |
| connectionLimit | number | Number of simultaneous connections when connectionPooling is enabled. |
| host | string | The database host. |
| port | number | The database post. |
| database | string | The database instance name. |
| scheme | string | The schema within your database to use |
| user | string | The user with which to connect to the database. |
| password | string | The user's password with which to connect to the database. |
| generateModelsFromSchema | boolean | If enabled, API Builder will automatically interrogate the database and auto-generate Models from SQL tables. |
| modelAutogen | boolean | If enabled, API Builder will automatically generate a full and rich CRUD API from the generated Models. |

## Usage

After you configure the connector, you can start up your API Builder project and visit the console (normally found under http://localhost:8080/console). Your connector will be listed under the [Connectors](http://localhost:8080/console/project/connectors) section of the console.

Your database tables will be listed under the [Models](http://localhost:8080/console/project/models) section of the console. You can now click on the gear icon to the right of the table names and generate flow based APIs.

You can also reference the connector in a custom model.

```javascript
const Account = APIBuilder.Model.extend('Account', {
  fields: {
    Name: { type: String, required: true }
  },
  connector: 'postgres'
});
```

If you want to map a specific model to a specific table, use metadata.  For example, to map the `account` model to the table named `accounts`, set it such as:

```javascript
const Account = APIBuilder.Model.extend('account', {
  fields: {
    Name: { type: String, required: false, validator: /[a-zA-Z]{3,}/ }
  },
  connector: 'postgres',
  metadata: {
    'mysql': {
      table: 'accounts'
    }
  }
});
```

## Known issues and limitations

1. Only supports SQL tables.
1. Does not support views.
1. Does not support stored procedures.

## Changes

#### 1.0.0
- Initial version of the connector

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
