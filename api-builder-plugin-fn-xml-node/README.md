# API-Builder XML-Flow node

Use this extension to add an XML-Flow node to your [Axway API-Builder](https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder.html) project. With that you can convert XML-Payload you may have received from a backend stream (e.g. a SOAP-Service) into a Javascript Object for further processing or directly into a JSON-String. That allows you to easily merge data from different sources and formats into a JSON-Based-REST-API.  
The Flow-Node is based on the [XML-JS](https://www.npmjs.com/package/xml-js) Library.

## Convert XML to JSON
After have installed the XML-Node into your API-Builder project, Drag & Drop the XML-Node into your flow and select the method: XML to JSON. You get the following configuration options:  
![XML Node Settings](https://github.com/Axway-API-Builder-Ext/xml-node/blob/master/misc/images/xml-flow-node-settings.png)  
Provide the XML data should be converted into JSON using either a Selector or a plain XML-String.
Secondly you can decide if you would like to have a Javascript Object or the JSON-Payload as String.

## Convert JSON to XML
> This is not yet supported!


## Install
After creating your API Builder service (`api-builder init`), you can install this plugin using npm:

```
npm install --no-optional @axway-api-builder-ext/api-builder-plugin-fn-xml-node
```
After installation start the API-Builder project and you get the following node:  
![XML Node](https://github.com/Axway-API-Builder-Ext/xml-node/blob/master/misc/images/xml-flow-node.png)

## Changelog
- 1.0.0 - 05.12.2019
  - Initial version supporting XML to JSON
  
## Limitations/Caveats
- JSON to XML not yet supported

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  


## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"


## License
[Apache License 2.0](/LICENSE)
