const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');

module.exports = {  
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