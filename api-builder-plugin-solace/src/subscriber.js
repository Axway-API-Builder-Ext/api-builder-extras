const sessionFactory = require('./session');

module.exports = async (solace, topicName, messageListener, pluginConfig, log) => {
    let subscribed = false;
    let session;
    await connect();
    process.stdin.resume();
    process.on('SIGINT', function () {
        exit();
    });

    return { isConnected, connect, disconnect, unsubscribe, exit, subscribe };

    function isConnected() {
        if (session) {
            log.info('Already connected and ready to subscribe.');
            return true;
        }
        return false;
    }

    // Establishes connection to Solace message router
    async function connect() {
        return new Promise((resolve, reject) => {
            if (!isConnected()) {
                session = sessionFactory(solace, pluginConfig, log);
            }
            // define session event listeners
            session.on(solace.SessionEventCode.UP_NOTICE, function (sessionEvent) {
                log.info('=== Successfully connected and ready to subscribe. ===');

                // Don't resolve here we need to reach SUBSCRIPTION_OK state
                try {
                    subscribe();
                } catch (error) {
                    log.info(error.toString());
                    reject(error);
                }
            });
            session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, function (sessionEvent) {
                log.info('Connection failed to the message router: ' + sessionEvent.infoStr +
                    ' - check correct parameter values and connectivity!');
                reject();
            });
            session.on(solace.SessionEventCode.DISCONNECTED, function (sessionEvent) {
                log.info('Disconnected.');
                subscribed = false;
                if (session !== null) {
                    session.dispose();
                    session = null;
                }
            });
            session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, function (sessionEvent) {
                log.info('Cannot subscribe to topic: ' + sessionEvent.correlationKey);
                reject();
            });
            session.on(solace.SessionEventCode.SUBSCRIPTION_OK, function (sessionEvent) {
                if (subscribed) {
                    subscribed = false;
                    log.info('Successfully unsubscribed from topic: ' + sessionEvent.correlationKey);
                } else {
                    subscribed = true;
                    log.info('Successfully subscribed to topic: ' + sessionEvent.correlationKey);
                    log.info('=== Ready to receive messages. ===');
                }
                resolve();
            });
            // define message event listener
            session.on(solace.SessionEventCode.MESSAGE, messageListener);
            // connect the session
            try {
                session.connect();
            } catch (error) {
                log.info(error.toString());
                reject(error);
            }
        });
    };

    // Subscribes to topic on Solace message router
    function subscribe() {
        if (session !== null) {
            if (subscribed) {
                log.info('Already subscribed to "' + topicName
                    + '" and ready to receive messages.');
            } else {
                log.info('Subscribing to topic: ' + topicName);
                session.subscribe(
                    solace.SolclientFactory.createTopicDestination(topicName),
                    true, // generate confirmation when subscription is added successfully
                    topicName, // use topic name as correlation key
                    10000 // 10 seconds timeout for this operation
                );
            }
        } else {
            log.info('Cannot subscribe because not connected to Solace message router.');
            throw new Error('Cannot subscribe because not connected to Solace message router.');
        }
    };

    function exit() {
        unsubscribe();
        disconnect();
        setTimeout(function () {
            process.exit();
        }, 1000); // wait for 1 second to finish
    };

    // Unsubscribes from topic on Solace message router
    function unsubscribe() {
        if (session !== null) {
            if (subscribed) {
                log.info('Unsubscribing from topic: ' + topicName);
                try {
                    session.unsubscribe(
                        solace.SolclientFactory.createTopicDestination(topicName),
                        true, // generate confirmation when subscription is removed successfully
                        topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    log.info(error.toString());
                }
            } else {
                log.info('Cannot unsubscribe because not subscribed to the topic "'
                    + topicName + '"');
            }
        } else {
            log.info('Cannot unsubscribe because not connected to Solace message router.');
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