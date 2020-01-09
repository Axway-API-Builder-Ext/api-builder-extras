# API-Builder Community Plugins

[Axway API-Builder][3] is a very flexible low-code no-code framework that  helps
customers to create or optimize APIs for an API-Management governance layer by:
- orchestrating system of record APIs into a business oriented API
  - connect to different Cloud- or On-Premise applications
  - connect to databases to create CRUD APIs in minutes
- transform / mediate downstream APIs

Watch this [video][5] to learn more about API-Builder or just [get started][6].

The underlying framework of API-Builder is [Node.js][7] using a bunch of
[NPM][8] packages.  
This repository is used to maintain community packages following the process
described below.  
There are some benefits why it makes sense to share your plugin:  
- Axway takes care about this repository to test, release and publish your package
- upon Axway decision the plugin gets integrated into the API-Builder Plugin UI for simple installation and discovery
- Broader community and Axway support will help to improve your plugin
- Quality-Gate for changes on existing plugins  
- Axway helps on a best-effort basis to support the community plugins

Once a plugin package has been approved by the Axway API-Builder core team it will appear for installation in the API-Builder Admin UI:  
![API-Builder Plugin-Screen][plugins-screen]

## Community Maintenance

Please note that API-Builder Plugins in this repository are maintained by the community. The current maintainer is listed in `package.json` and will address the pull requests and issues opened for that API-Builder plugin. Additionally, Axway will assist on a best-effort basis, and will support the current maintainer whenever possible. When submitting a new plugin, please indicate in the Pull-Request that you're willing to become the maintainer. For current maintainers, we understand circumstances change. If you're no longer able to maintain a plugin, please notify us so we can find a new maintainer or mark the plugin as orphaned. If you have any questions about the process, don't hesitate to contact us.

## Create your first plugin
API-Builder supports different kind of plugins. Learn more in the [Axway documentation][9].  
To share a plugin you have created with the community and make it available in the
API-Builder UI, please follow this process:
1. Implement the plugin locally as described below and in the Axway documentation.
  - you can build and test the plugin locally at all time
2. Create a fork of the [api-builder-extras][0] repository
3. Within that fork create a unique folder for your plugin using this naming convention:
  - Flow-Nodes: api-builder-plugin-fn-<name>
  - Flow-Node connectors: api-builder-plugin-fc-<name>
  - Data-Connectors: api-builder-plugin-dc-<name>
4. Insert your new plugin into that folder
5. Update the package.json
  - Especially the fields: name, version, repository, homepage, bugs
6. Create your unique GitHub actions based on the template `.github/workflows/_template*`
  - you need to adjust the ID after you have copied the template 

Once you have completed the development of your new API-Builder plugin, submit
a [pull request][1] to have Axway review your code. Once we've reviewed your
plugin, we will approve and merge your pull request or provide feedback.
When approved and merged we will release an NPM package. From this point on the
plugin can be installed in API-Builder using `npm install`.  

The Axway API-Builder core team will finally decide if that package becomes part of the
Plugin-List as part of the next release. This allows also other API-Builder users to
quickly discover and manage you plugin.  


### Flow-Nodes
A flow node can be used as part of an API-Builder flow to process any kind of
data available in the flow context. For instance create an MD5 Hashsum based on a
header variable, etc.  
Use the [Flow-Node SDK][10] to create a new flow node.

### Flow-Node Connectors
The actual flow-node connectors are based on the Swagger-Flow-Node, that allow you
to create a Connector based on a Swagger-Definition.
[Learn more][11] in the documentation and just review existing Flow-Connectors.

### Data-Connectors
A Data-Connector is the most sophisticated plugin. Please check existing
[Data-Connectors][12] or create an [issue][2] for help.

## Reporting Issues

To report issues or get help, please create an [issue][2] here on GitHub.

[0]: https://github.com/Axway-API-Builder-Ext/api-builder-extras
[1]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/compare
[2]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues
[3]: https://www.axway.com/en/products/api-management/build-apis
[4]: https://www.axway.com
[5]: https://www.youtube.com/watch?v=4_0VG3Yx_Ig
[6]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html
[7]: https://nodejs.org/en/
[8]: https://www.npmjs.com/
[9]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_plugins.html
[10]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/axway_flow_sdk.html
[11]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/swagger_flow-node.html
[12]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_connectors.html

[plugins-screen]: misc/api-builder-admin-plugins.png
