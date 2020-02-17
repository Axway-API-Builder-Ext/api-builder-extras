exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(`Hello from ${event.key1} from AWS-Lambda!`),
    };
    return response;
};
