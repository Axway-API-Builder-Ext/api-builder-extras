# API-Builder MongoDB Flow-Node

## About this Flow-Node

With this flow node you can communicate directly with a MongoDB, for example to store, update JSON documents, etc. directly on the API builder flow out. So it is not necessary to have a corresponding model. You can use this flow node for the API-First approach of the API Builder.

## Configuration

Declare the environment variables: MONGODB_URL and MONGODB_COLLECTION. For example:  
```
MONGODB_URL=mongodb://api-env:27017/order_status
MONGODB_COLLECTION=myMongoCollection
```
They will be picked up by the configuration file: `mongodb.default.js`.

## Tests
To run the tests:  
```
set MONGODB_URL=mongodb://api-env:27017/myDatabase
set MONGODB_COLLECTION=myCollection
npm test
```  
The tests are also automatically executed on every push or pullrequest to this project. 

## Compatibility
Tested with API-Builder Quezes

## Limitations/Caveats
- Authenticaion is not supported - Create an issue if this is required

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"