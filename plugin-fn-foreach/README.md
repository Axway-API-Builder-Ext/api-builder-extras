[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/Foreach%20Flow-Node%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions?query=XML+Flow)

This node is like an Array.forEach(). It iterates over the array invoking a flow for each element.

## Creating the nested flow
One of the unsupported features is to create a flow that isn't bound to an endpoint.
That means, there's actually no UI for doing this.  
However, just can manually create an empty flow in `/flows`.

To streamline the process, we have install two sample flows
during installation into your `flows` directory.
- `/flows/ExampleParentFlow.json`
- `/flows/PerItemFlow.json`

After restarting you API-Builder project you can access them like so:
- The MainFlow ([See it here][example-parent-flow]) calling a nested flow:  
http://localhost:8080/console/project/flows/ExampleParentFlow/edit  
- The nested flow ([See it here][example-nested-flow]) which is called:  
http://localhost:8080/console/project/flows/PerItemFlow/edit  

_Best is to open both flows in parallel in two Browser-Tabs at the same time._

The nested flow parameter: `items` has to be an object, so __no iterating over arrays of primitives yet__. Configured like so:
| Working | Not-Working | 
| --- | --- |
| ![Correct items parameter][items-parameter] | ![Wrong items parameter][wrong-items-parameter]|  

Additionally, parameters have to pass schema validation in the nested flow.
For example when interating in the main flow over `[ { name: 'Tom' }, { name: 'Dick' }, { name: 'Harry' }]`
the nested flow gets an object: `{ name: 'Dick' }`, hence the parameter must be configured like so:   

```
	"parameter": {
		"properties": {
		    "name": { "type": "string" }
		},
		"additionalProperties": false,
		"required": []
	},
```

In the example above, the flow will execute 3 times, as the array had 3 elements.
`$.name` will be the `Tom` on the first, `Dick` on the second, and `Harry` on the third.

You can use the nested flow template directly or create you own copy in the `flows` folder.  
The example parent flow is considered as an example helping you to configure you own flow.  

The return value of the flow is the value stored in `$.response`.

## Flow

The _Flow_ method iterates over an array of objects and invokes the specified flow with the object as the input.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| flow | string | y | The flow id of the flow to execute. |
| items | array | y | The array to iterate over. |

![For each flow][flow-editor]

## Install

After creating your API Builder service (`api-builder init`), you can install this plugin using npm:

```
npm install --no-optional @axway-api-builder-ext/api-builder-plugin-fn-foreach
```

[flow-editor]: imgs/foreachFlow.png
[items-parameter]: imgs/items_parameter.png
[wrong-items-parameter]: imgs/wrong_items_parameter.png
[example-parent-flow]: imgs/ExampleParentFlow.png
[example-nested-flow]: imgs/ExampleNestedFlow.png
