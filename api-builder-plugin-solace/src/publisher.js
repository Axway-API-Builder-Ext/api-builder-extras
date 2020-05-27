const sessionFactory = require('./session');

module.exports = async (solace, topicName, messageContent, pluginConfig, log) => {
    let session = null;
    await connect();
    return { connect, disconnect, publish };

    // Establishes connection to Solace message router
    async function connect() {
        return new Promise((resolve, reject) => {
            if (session !== null) {
                log.info('Already connected and ready to publish.');
                return;
            }
            session = sessionFactory(solace, pluginConfig, log);

            // define session event listeners
            session.on(solace.SessionEventCode.UP_NOTICE, function (sessionEvent) {
                log.info('=== Successfully connected and ready to publish messages. ===');
                try {
                    publish();
                    resolve();
                } catch(e) {
                    reject(e);
                }
            });
            session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, function (sessionEvent) {
                log.info('Connection failed to the message router: ' + sessionEvent.infoStr +
                    ' - check correct parameter values and connectivity!');
                reject();    
            });
            session.on(solace.SessionEventCode.DISCONNECTED, function (sessionEvent) {
                log.info('Disconnected.');
                if (session !== null) {
                    session.dispose();
                    session = null;
                }
            });
            // connect the session
            try {
                session.connect();
            } catch (error) {
                log.info(error.toString());
                reject();
            }
        });
    };

    // Publishes one message
    function publish() {
        if (session !== null) {
            const message = solace.SolclientFactory.createMessage();
            message.setDestination(solace.SolclientFactory.createTopicDestination(topicName));
            message.setBinaryAttachment(JSON.stringify(messageContent));
            message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
            session.send(message);
            log.info(`Message: ${messageContent}`);
            log.info('Message published.');

            //TODO: comment this if we don't want to disconnect publisher
            disconnect();
        } else {
            log.info('Cannot publish because not connected to Solace message router.');
            throw new Error('Cannot publish because not connected to Solace message router.');
        }
    };

    // Gracefully disconnects from Solace message router
    function disconnect() {
        log.info('Disconnecting from Solace message router...');
        if (session !== null) {
            try {
                session.disconnect();
            } catch (error) {
                log.info(error.toString());
            }
        } else {
            log.info('Not connected to Solace message router.');
        }
    };
};