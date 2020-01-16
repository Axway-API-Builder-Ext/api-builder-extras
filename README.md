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
described [below](#share-a-plugin).  

### Why sharing a plugin here?

There are a number of benefits why it makes sense to share your plugin:  
- Axway takes care about this repository to test, release and publish your package
- upon Axway decision the plugin gets integrated into the API-Builder Plugin UI for simple installation and discovery
- Broader community and Axway support will help to improve your plugin
- Quality-Gate for changes on existing plugins  
- Axway helps on a best-effort basis to support the community plugins

Once a plugin package has been approved by the Axway API-Builder core team it will appear for installation in the API-Builder Admin UI. That way, it is discoverable by all developers with the same organization or external organization:    
![API-Builder Plugin-Screen][plugins-screen]

## Community Maintenance

Please note that API-Builder Plugins in this repository are maintained by the community. The current maintainer is listed in `package.json` and will address the pull requests and issues opened for that API-Builder plugin. Additionally, Axway will assist on a best-effort basis, and will support the current maintainer whenever possible. When submitting a new plugin, please indicate in the Pull-Request that you're willing to become the maintainer. For current maintainers, we understand circumstances change. If you're no longer able to maintain a plugin, please notify us so we can find a new maintainer or mark the plugin as orphaned. If you have any questions about the process, don't hesitate to contact us.

## Create your first plugin
API-Builder supports different kind of plugins. Learn more in the [Axway documentation][9].  

### Flow-Nodes
A flow node can be used as part of an API-Builder flow to process any kind of
data available in the flow context. For instance create an MD5 Hashsum based on a
header variable, etc.  
Use the [Flow-Node SDK][10] to create a new flow node.

### Flow-Node Connectors
The actual flow-node connectors are based on the Swagger-Flow-Node, that allow you
to create a Connector based on a Swagger-Definition.
[Learn more][11] in the documentation and just review existing Flow-Connectors (name `api-builder-plugin-fc*`).

### Data-Connectors
A Data-Connector is the most sophisticated plugin. They provide Data-Models based on sources (e.g. databases) to create CRUD-APIs or to be used as part of a flow. Please check existing [Data-Connectors][12] or create an [issue][2] if you need help for another data-connector.  

## How to Contribute

### Share your Plugin
After you have implemented and tested your plugin locally, you can share that plugin with the API-Builder community using this repository.
That way, you make it discoverable in the API-Builder UI, you can leverage the community to improve it and Axway supports you on a best-effort basis.  
We are using GitHub [Pull-Requests][13] to allow you to contribute and the only thing you need is a GitHub account. 

### Improve existing plugins
If you found an issue or you have improved an existing plugin yourself, we highly appreciate if you make that changes available to the community as well. It is as simple as creating a Pull-Request as described in step 9 below.

### To share your plugin, please follow this process:
1. Create a [fork][14] of this repository, which basically creates your own copy still linked to the original repository
2. We recommend to [clone][15] your forked repository to your local disc (e.g. using GitHub Desktop)
    - instead of working with the GitHub WebUI only
3. Create a unique folder for your plugin using this naming convention:
    - Flow-Nodes: `api-builder-plugin-fn-<name>`
    - Flow-Node connectors: `api-builder-plugin-fc-<name>`
    - Data-Connectors: `api-builder-plugin-dc-<name>`
4. Insert your new plugin code into that folder
    - Review existing plugins to understand the structure
    - Please provide unit tests for your plugin wherever possible
5. Update the package.json
    - Especially the fields: 
        - __name__: should start with: `@axway-api-builder-ext/api-builder-plugin....`
        - __version__: Stable has a version 1.x.x, all other something 0.x.x
        - __description__: Provide a meaningful description. This will appear in the API-Builder UI plugin dialog
        - __author__: Add your GitHub ID or email address (this is used to assign issues/pullrequests)
        - __homepage__: Should point to your unique folder within this repository
        - __keywords__: Add more keywords to make it easier to discover your plugin
    - There might be more changes needed depending on what your plugin does
6. Create new GitHub actions based on the templates `.github/workflows/*_template`
    - these workflows are used to automatically tests and release/publish your plugin
    - Replace all occurencies of `NAME_OF_YOUR_PLUGIN` in both workflow files with a valid name not longer than 20 characters
    - Replace all occurencies of `THE_FOLDER_NAME_OF_YOUR_PLUGIN` with the folder name of your plugin
7. Provide a README.md 
    - What your plugin does
    - How to use it (e.g. add images, examples, etc.) to make it easy for developers to understand it
    - Mention potential limitions/caveats/known issues
8. Create a package-lock.json
    - Run `npm install` to create a `package-lock.json`
    - This is required to lock down used modules before testing and releasing it
9. Commit your changes to your forked repository and create a [Pull-Reuqest][13]
    - We take it from there, review your plugin or changes you propose 
    - if required, we propose or add further changes or just start a conversation when having questions
    - Finally the changes are merged into the master branch of this repository 
10. Release/Publish the plugin
    - we will test/release/publish the plugin as an NPM module using the workflows you provided
    - the API-Builder core team will ultimately decide if the plugin get listed in the next release


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
[13]: https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request
[14]: https://help.github.com/en/github/getting-started-with-github/fork-a-repo
[15]: https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository

[plugins-screen]: images/api-builder-admin-plugins.png
