![AWS Lambda Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/AWS%20Lambda%20Tests/badge.svg)

# API-Builder AWS-Lambda Flow-Node

If you would like to integrate AWS Lambda functions into your [API-Builder flow][1] use this flow node.
It allows you to easily call your Lambda-Functions and merge, transform or use the returned data in any way you want.

Watch this video to see the AWS-Lambda connector in action:  
[![Install AWS-Lambda Connector](https://img.youtube.com/vi/a4Fp94vbfU4/0.jpg)](https://youtu.be/a4Fp94vbfU4)

## Configuration

After installation and restarting your API-Builder project you get the following new flow-node:  
![Node][img1]   
Before you can make use it in your flow you have to configure your AWS-Credentials allowed to invoke Lambda functions.  

During installation a new config file has been automatically created which must be completed with your AWS Credentials. You can do that directly from within the API-Builder UI:  
![Config][img3]  
We recommend to setup your configuration in a [environmentalized][4] way keeping [sensitive information][5] away from the source-code repository.

## Invoke Lambda functions
To invoke a Lambda function, just drag & drop the Flow-Node into your flow and set it up as described here.  
![Node][img2]

### Input parameters

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| func | string | y | The name of the AWS-Lambda-Function to call.  |
| payload | JSON&nbsp;or&nbsp;Object | n | Input information required by the Lambda-Function. Example: `{"key1":"value1"}` |
| asynchronous | boolean | n | If enabled the Lambda function is invoked asyncronously and no data is returned. Read more here: https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html.  |
| logResult | boolean | n | If enabled, the Tail option is used when invoking the Lambda function and logged in the API Builder Console.  |

### Output
If the function wasn't invoked asynchronously you get back the `data.Payload` into attribute configured with next. By default: `$.result`. For example, having the following AWS-Lambda function: 
```js
exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: "Hello from " + event.key1 + " from AWS-Lambda!"
    };
    return response;
};
```
Using the payload: `{"key1":"Chris"}` the attribute `$.result` will contain the following: `Howdy Hello from Chris from AWS-Lambda!`.  
In case of an error the attribute: `$.error` contains the error returned by AWS or by the Lambda-Fow-Node.  
  
If the function is invoked asynchronously no data is returned. The attribute: `$.result` just contains the value: `Accepted`. 

## Compatibility
Tested with AWS Lambda Q1/2020  
Requires API-Builder Independence or higher

## Changelog
See [Change-Log][6]

## Limitations/Caveats
Nothing known

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"

[1]: https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/flows/index.html
[2]: https://docs.axway.com/bundle/api-builder/page/docs/getting_started/index.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues
[4]: https://docs.axway.com/bundle/api-builder/page/docs/security_guide/index.html#environmentalization
[5]: https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/project/configuration/project_configuration/index.html#configuration-files
[6]: Changelog.md

[img1]: imgs/lambda-flownode.png
[img2]: imgs/lambda-invoke.png
[img3]: imgs/Lambda-Connector-Config.png
[img4]: imgs/Lambda-Connector-Config-File.png
