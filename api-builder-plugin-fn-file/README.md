[![Build Status](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/File%20Flow-Node%20Tests/badge.svg)](https://github.com/Axway-API-Builder-Ext/api-builder-extras/actions)

# API-Builder File Flow-Node

This node can be used to read and write files in your [API-Builder flow][1].  

The following file types are supported/planned:   

| File&nbsp;Type   | Description | Status |
| ----------- | ----------- | ------ |
|[CSV](#csv-files)       |You can read/write from and to CSV-Files, filter records and columns and directly convert it into a JavaScript object |Support&nbsp;for&nbsp;Read|
|JSON      |You can read/write from and to JSON-Files and directly convert it into a JavaScript object |Planned|
|XML       |You can read/write from and to XML-Files and directly convert it into a JavaScript object |Planned|
|[Plain-Text](#plain-text)|Just read and write plain text|Planned|

# CSV Files

With this flow-node you can read CSV-File and make the content available to your flow. With that, you can for instance
enrich data taken from the CSV-File and merge it with data you got before.

## Read

To Read a CSV-File, you have to make it available to the API-Builder project. For instance putting it directly into your
API-Builder app and reference it then with a relative path.

### Input parameters

The CSV Read-Operation supports a number of input parameters:

| Param       | Type        | Required | Description |
| ----------- | ----------- | -------- | ----------- |
| filename          | string | y | The name of the CSV file you would like to read. This file is given either absolute or relative to the API-Builder project. For instance, when putting a file into `conf/my-file.csv` you just configured `conf/my-file.csv` |
| delimiter         | string | n | The delimeter of your CSV-File. Defaults to ,  Configure any other character, when your CSV-File is splitting records differently.|
| filterColumn      | string | n | The CSV column name used to filter using the filterValues. This parameter is ignored, if filterValues is not set. |
| filterValues       | string\|array | n | This value is used to filter entries in the configured filterColumn. It can be either a simple string or an array of string. The parameter is case-sensitve. This parameter is ignored, if filterColumn is not set. |
| uniqueResult      | boolean | n | Turn this on if you require a unique result (exactly 1). If not unique or nothing is found the flow node fails. |
| resultColumns     | array | n | An array of CSV column names you want in the result. The column names are expected in the first line or using the parameter: `columns`you can override the column names. Example: ["columnA", "columnF", "columnT"] |
| quote             | string | n | Optional character surrounding a field. This is required, when the delimiter is used as part of a field; one character only. The default is double quote. |
| comment           | string | n | Treat all the characters after this one as a comment. Used this, when your CSV-File contains lines with comments. E.g. using a # |
| columns           | array | n | Provide an array of column headers if your CSV has NO headers or you would like to have different field names. |
| relax_column_count| boolean | n | Discard inconsistent columns count. If a column is missing for a record a reduced dataset is returned. |

### Output

The content from the CSV-File is converted into a Java-Script object, so that you can easily use it in your flow.   

For instance the following input:
```
ReturnCode, ResponseMessage, LastUpdate, Author
401, You have no permission, 16.01.2020, Chris
500, Internal server error, 17.01.2020, Charles
```
is made available to the flow as the following object:
```
{
  ReturnCode: '401',
  ResponseMessage: 'You have no permission',
  LastUpdate: '16.01.2020',
  Author: 'Chris'
},
{
  ReturnCode: '500',
  ResponseMessage: 'Internal server error',
  LastUpdate: '17.01.2020',
  Author: 'Charles'
}
```
When using the default output attribute: `$.content` you can access the data inside your flow like so: `$.content.1.ReturnCode` to get the second return-code.  

Using the parameters: `filterColumn`, `filterValues` and `uniqueResult` you can limit the data to one record. In that case, the data is always stored in the first object: `$.content.0.ReturnCode`

## Write

This is not yet supported. Please create an [issue][3] describing your use-case, if you need support for it.

# JSON Files

## Read

This is not yet supported. Please create an [issue][3] describing your use-case, if you need support for it.

## Write

This is not yet supported. Please create an [issue][3] describing your use-case, if you need support for it.

# XML Files

## Read

This is not yet supported. Please create an [issue][3] describing your use-case, if you need support for it.

## Write

This is not yet supported. Please create an [issue][3] describing your use-case, if you need support for it.

# Plain Text

## Read

This is not yet supported. Please create an [issue][3] describing your use-case, if you need support for it.

## Write

The intention of this operation is to write the content of an attribute into a on your API-Builder project. As an API-Builder project is supposed to run in a docker container and the nature of it, the location should be an external share.

### Input parameters

The Write-Operation supports a number of input parameters:

| Param       | Type        | Required | Description |
| ----------- | ----------- | -------- | ----------- |
| filename          | string | y | The name of the file you would like to write. This filename is given either absolute or relative to the API-Builder project. For instance, when using a filename like `conf/output.txt` the file is written in the conf folder within you API-Builder project.|
| data         | string | Y | This is parameter contains the data to write to the filter. You can either use a hard-coded string, but very likely you use a selector to reference for instance the received content body|
| overwrite      | boolean | n | Set this optional toggle to true, if you would like to overwrite already existing files. |
| dataEncoding       | string | n | Optionally, set the data encoding, which is used to write the file. If not set UTF-8 is used. |
| stringify      | boolean | n | By default, if data is an Object, it is automatially stringified (JSON.stringify). Using this option you can turn off that feature.|

### Output

#### Next 
Is followed when the file has been successfully writen. The variable contains the filename of file.

#### Error
An error has occured and you get back the error message.

After creating your API Builder service (`api-builder init`), you can install this plugin using npm:

```
npm install api-builder-plugin-fn-file
```

## Changelog
See [Change-Log][6]

[1]: https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/flows/index.html
[2]: https://docs.axway.com/bundle/api-builder/page/docs/getting_started/index.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues

[6]: Changelog.md

[filter]: imgs/flownode-filter.png
[filter-include]: imgs/flownode-filter-include.png
[filter-exclude]: imgs/flownode-filter-exclude.png
