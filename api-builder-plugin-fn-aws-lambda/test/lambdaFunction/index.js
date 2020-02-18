exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: `Hello from ${event.key1} from AWS-Lambda!`
    };
    return response;
};
