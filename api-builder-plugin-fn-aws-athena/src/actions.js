/**
 * Action method.
 * @param {object} req - The flow request context passed in at runtime.  The
 *	 parameters are resolved as `req.params` and the available authorization
 * credentials are passed in as `req.authorizations`.
 * @param {object} outputs - A set of output callbacks.  Use it to signal an
 *	 event and pass the output result back to the runtime.  Only use an
 *	 output callback once and only after all asyncronous tasks complete.
 * @return {undefined}
 */
function query(req, outputs, options) {
  const db = req.params.db;
	const table = req.params.table;
  const fields = req.params.fields;
  const limit = req.params.limit;


  if (!table) {
		return outputs.error(null, new Error('Missing required parameter: table'));
	}
  if (!fields) {
		return outputs.error(null, new Error('Missing required parameter: fields'));
	}
  if (!db) {
		return outputs.error(null, new Error('Missing required parameter: db'));
	}

  (async () => {
    let myQuery = {
        sql: `SELECT ${fields} FROM ${table}`,
        db: db
    };
    if(limit) {
      myQuery.sql = myQuery.sql + ` LIMIT ${limit}`
    } else {
      myQuery.sql = myQuery.sql + ` LIMIT 5`
    }
    try {
      var results = await this.athenaClient.query(myQuery);
      return outputs.next(null, results);
    } catch (error) {
      options.logger.error(`Failed to execute query: ${error}`)
      return outputs.error(null, error);
    }
  })();
}

module.exports = {
	query
};
