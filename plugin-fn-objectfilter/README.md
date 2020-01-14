[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/Foreach%20Flow-Node%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions?query=XML+Flow)

# API-Builder XML Flow-Node

This node can be used to filter certain fields of an object in your [API-Builder flow][1].
This is useful if you would like to remove for instance confidential information
before further processing or exposing the API.  

When you have installed this flow node you get the following new option for your flow:  
![Flownode Filter][filter]

## Include

With the method `Include` only the given fields will remain in created object, all
other fields will be removed.  
![Flownode Filter Method include][filter-include]

## Exclude
With the method `Exclude` the given fields will be removed from the object, not mentioned
fields will remain.    
![Flownode Filter Method exclude][filter-exclude]

## Install

After creating your API Builder project (`api-builder init`), you can install this plugin using npm:

```
npm install --no-optional @axway-api-builder-ext/api-builder-plugin-fn-objectfilter
```


[1]: [https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html]

[filter]: imgs/flownode-filter.png
[filter-include]: imgs/flownode-filter-include.png
[filter-exclude]: imgs/flownode-filter-exclude.png
