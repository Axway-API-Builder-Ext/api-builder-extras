const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');

module.exports = {
  /** 
   * Standard way of creating plugin
   */
  createPlugin: () => {
    const sdk = new SDK();
    sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
    return sdk.getPlugin();
  },
  /** 
   * Create the plugin and set the provided context to all actions.
   */
  createPluginWithContext: (ctx) => {
    const sdk = new SDK();
    sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions);
    const plugin = sdk.getPlugin();
    const flownodeMethods = plugin.flownodes['redis'].methods;
    Object.keys(flownodeMethods).map((method) => {
      flownodeMethods[method].action = actions[method].bind(ctx);
    })    
    return plugin;
  },
  /** 
   * Allow you to register hooks executed on API Builder lifecycle events.
   * Call this method once.
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
    instance.on('stopping', hooks.stopping);
  }
}