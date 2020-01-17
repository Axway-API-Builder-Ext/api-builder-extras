[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/JIRA%20CP%20Connector%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions)

# API-Builder File Flow-Node

This node can be used to read and write files in your [!API-Builder flow][1].  

The following file types are supported/planned:
|File Type |Description|Status|
|----------|-----------|------|
|CSV       |You can read/write from and to CSV-Files, filter records and columns and directly convert it into a JavaScript object |Support for Read|
|JSON      |You can read/write from and to JSON-Files and directly convert it into a JavaScript object |Planned|
|XML       |You can read/write from and to XML-Files and directly convert it into a JavaScript object |Planned|
|Plain-Text|Just read and write plain text|Planned|

# CSV Files

With this flow-node you can read CSV-File and make the content available to your flow. With that, you can for instance
enrich data taken from the CSV-File and merge it with data you got before.

## Read

To Read a CSV-File, you have to make it available to the API-Builder project. For instance putting it directly into your
API-Builder app and reference it then with a relative path.

### Input parameters

The CSV Read-Operation comes with a number of input parameters:
| Param | Type | Required | Description |
| --- | --- | --- | --- |
| filename          | string | y | The name of the CSV file you would like to read |
| delimiter         | string | n | The delimeter of your CSV-File. Defaults to , |
| filterColumn      | string | n | The CSV column name used to filter using the filterValue. This parameter is ignored, if filterValue is not set. |
| filterValue       | string\|array | n | This value is used to filter entries in the configured filterColumn. This parameter is ignored, if filterColumn is not set. |
| resultColumns     | array | n | An array of CSV column names you want in the result. The column names are expected in the first line. Example: ["columnA", "columnF", "columnT"] |
| quote             | string | n | Optional character surrounding a field. This is required, when the delimiter is used as part of a field; one character only |
| comment           | string | n | Treat all the characters after this one as a comment. Used this, when your CSV-File contains lines with comments. E.g. using a # |
| columns           | array | n | Provide an array of column headers if your CSV has NO headers or you would like to have different field names. |
| relax_column_count| boolean | n | Discard inconsistent columns count. If a column is missing for a record a reduced dataset is returned. |

### Output

The content from the CSV-File is converted into a Java-Script object, so that you can easily use it in your flow.   

For instance the following input:




## Write

# JSON Files

## Read

## Write

# XML Files

## Read

## Write

# Plain Text

## Read

## Write

After creating your API Builder service (`api-builder init`), you can install this plugin using npm:

```
npm install api-builder-plugin-fn-file
```

[1]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html
[2]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html

[filter]: imgs/flownode-filter.png
[filter-include]: imgs/flownode-filter-include.png
[filter-exclude]: imgs/flownode-filter-exclude.png
