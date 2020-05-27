module.exports = function (solace, pluginConfig, log) {
  try {
    return solace.SolclientFactory.createSession({
      url: pluginConfig.url,
      vpnName: pluginConfig.vpnName,
      userName: pluginConfig.userName,
      password: pluginConfig.password
    });
  } catch (error) {
    log.error(error.message);
  }
}
