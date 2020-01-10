# @bladedancer/api-builder-plugin-gm-foreach

> This node is experimental and uses unsupported hacks.

This node is like an Array.forEach(). It iterates over the array invoking a flow for each element.

## Creating the nested flow
One of the unsupported features is to create a flow that isn't bound to an endpoint. There's no UI for doing this, so create a empty flow in `/flows`. 

```
{
	"schemaVersion": "3",
	"info": {
		"name": "PerItem",
		"description": "Do something",
		"author": "support@axway.com",
		"license": "ISC"
	},
	"parameter": {
		"properties": {
		},
		"additionalProperties": false,
		"required": [
		]
	},
	"start": "",
	"nodes": {
	}
}
```

The flow parameter has to be an object, so no iterating over arrays of primitives yet. Also the parameters have to pass schema validation. For example to iterate over `[ { name: 'Tom' }, { name: 'Dick' }, { name: 'Harry' }]` the parameter definition would be:

```
	"parameter": {
		"properties": {
		    "name": { "type": "string" }
		},
		"additionalProperties": false,
		"required": []
	},
```

Save this as `/flows/WhateverYouWant.json`. Then open the flow in the Flow Editor: [http://localhost:8080/console/project/flows/WhateverYouWant/edit](http://localhost:8080/console/project/flows/WhateverYouWant/edit).

In the example, the flow will execute 3 times - the array had 3 elements. `$.name` will be the `Tom` on the first, `Dick` on the second, and `Harry` on the third.

The return value of the flow is the value stored in `$.response`. 

## Flow

The _Flow_ method iterates over an array of objects and invokes the specified flow with the object as the input.

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| flow | string | y | The flow id of the flow to execute. |
| items | array | y | The array to iterate over. |

![ForEachFlow](./imgs/ForeachFlow.png)

## Install

After creating your API Builder service (`api-builder init`), you can install this plugin using npm:

```
npm install --save @axway/api-builder-plugin-fn-foreach
```
