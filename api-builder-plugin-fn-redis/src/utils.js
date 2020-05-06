const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');

module.exports = {
  /** 
   * Standard way of creating plugin
   */
  createPlugin: (actions) => {
    const sdk = new SDK();
    sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
    return sdk.getPlugin();
  },
  /** 
   * Create the plugin and set the provided context to all actions.
   */
  createPluginWithContext: (actions, ctx) => {
    const sdk = new SDK();
    sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
    const plugin = sdk.getPlugin();
    const flownodeMethods = plugin.flownodes['redis'].methods;
    Object.keys(flownodeMethods).map((method) => {
      flownodeMethods[method].action = actions[method].bind(ctx);
    });
    // Set ctx to plugin only in dev mode
    if (process.env.TEST_TYPE === 'integration') {
      plugin.redisClient = ctx.redisClient;
    }
    return plugin;
  },
  /** 
   * This method must be called once!
   * 
   * Register hooks executed on API Builder lifecycle events.
   * 
   * @param {object} hooks - object with a key that denotes a lifecycle
   *  event and value that refer to the function to register for that event.
   */
  registerRuntimeHooks: (hooks) => {
    let APIBuilder;
    try {
      APIBuilder = require('@axway/api-builder-runtime');
    } catch (ex) {
      throw new Error('Plugin is not loaded via an existing @axway/api-builder-runtime instance');
    }
    const instance = APIBuilder.getGlobal();
    if (!instance) {
      throw new Error('No @axway/api-builder-runtime instance');
    }
    Object.keys(hooks).forEach((event) => {
      instance.on(event, hooks[event]);
    });    
  },  
  /**
   * Tests whether or not the API Builder application is in developer mode.  The test
   * is to check to see if @axway/api-builder-admin exists.
   *
   * @returns {boolean} True if in developer mode.
   */
  isDeveloperMode: () => {
    try {
      // If we are in "development mode" we are going to have @axway/api-builder-admin
      // dependency installed. So we guarantee that only generate config files in
      // "development mode" and ensure immutable production environments.
      // eslint-disable-next-line import/no-unresolved
      require('@axway/api-builder-admin');
      return true;
    } catch (ex) {
      // when we run plugin test suite @axway/api-builder-admin is not there 
      // so we are kind of simulating production mode
      return false;
    }
  }
}