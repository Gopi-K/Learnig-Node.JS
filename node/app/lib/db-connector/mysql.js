/**
 * A db class to be used by other models.
 * Uses the following -
 * https://github.com/felixge/node-mysql
 *
 */

'use strict';

var uuid = require('node-uuid');
var mysql = require('mysql');

var AppError = require(__CONFIG__.app_base_path + 'lib/app-error');
var getStatus = require(__CONFIG__.app_base_path + 'lib/status');
var logger = require(__CONFIG__.app_base_path + 'logger');

var defaultMsg = {
  errorDbConn: 'There was an error while communicating with the database.',
  queryExecution: 'There was an error while executing the query.'
};

var transactionPool = {};

var pool = null;

/**
 * The base MySQL constructor.
 *
 * @param dbConfig
 *          Database configurations
 * @param customMsgs
 *          Use this parameter to override the custom messages used.
 */
function MySQL(dbConfig, customMsgs) {
  this.config = dbConfig;
  this.msgStrings = defaultMsg;
  this.pool = getPool(this.config);
  if (customMsgs !== undefined && customMsgs.errorDbConn && customMsgs.queryExecution) {
    this.msgStrings = customMsgs;
  }
}

/**
 * Use this for INSERT, UPDATE, DELETE queries
 *
 * @param objQuery
 *          Contains the following the properties
 *    - query - The SQL Query.
 *    - data - Data to be sent for the query.
 *    - cb - Callback method.
 */
MySQL.prototype.query = function (objQuery, cb) {
  objQuery = getDefaultValues(objQuery, this.config);
  runQuery(this, objQuery.query, objQuery.data, objQuery.timeout,
    objQuery.transactionID, cb);
};

MySQL.prototype.getResult = function (objQuery, cb) {
  objQuery = getDefaultValues(objQuery, this.config);
  runQuery(this, objQuery.query, objQuery.data, objQuery.timeout,
    objQuery.transactionID, function (err, data) {
      if (err) {
        return cb(err, null);
      }
      var response = {};
      if (data.length !== 0) {
        response = data[0];
      }
      return cb(null, response);
    });
};

MySQL.prototype.getResults = function (objQuery, cb) {
  objQuery = getDefaultValues(objQuery, this.config);
  runQuery(this, objQuery.query, objQuery.data, objQuery.timeout, objQuery.transactionID, cb);
};

/**
 * DB function that is used to start the transaction
 *
 * @param cb
 */
MySQL.prototype.beginTransaction = function (cb) {
  var transactionID = uuid.v4();
  var that = this;
  this.pool.getConnection(function (err, connection) {
    if (err) {
      return cb(err);
    }
    transactionPool[transactionID] = connection;
    connection.query({
      sql: 'START TRANSACTION;',
      timeout: that.config.queryTimeout
    }, function (err) {
      if (err) {
        destroyTransactionClient(that, transactionID, err);
        return cb(err);
      }
      return cb(null, transactionID);
    });
  });
};

/**
 * DB function that is used to commit the transaction
 *
 * @param transactionID
 * @param cb
 */
MySQL.prototype.commitTransaction = function (transactionID, cb) {
  var connection = transactionPool[transactionID];
  var that = this;
  var hadError = false;
  if (!connection) {
    return cb(new AppError(getStatus('internalErr'),
      'MySQL connection object not found.', {}));
  }
  connection.query({
    sql: 'COMMIT;',
    timeout: that.config.queryTimeout
  }, function (err) {
    if (err) {
      hadError = true;
      that.rollbackTransaction(transactionID, function (tErr) {
        if (tErr) {
          return cb({
            transaction: tErr,
            error: err
          });
        }
        return cb(err);
      });
    } else {
      destroyTransactionClient(that, transactionID);
      return cb(null);
    }
  });
};

/**
 * Function that is used to roll back the transaction
 *
 * @param transactionID
 * @param cb
 */

MySQL.prototype.rollbackTransaction = function (transactionID, cb) {
  var connection = transactionPool[transactionID];
  var that = this;
  if (connection) {
    connection.query({
      sql: 'ROLLBACK;',
      timeout: that.config.queryTimeout
    }, function (err) {
      destroyTransactionClient(that, transactionID);
      if (err) {
        return cb(err);
      }
      return cb(null);
    });
  }
};

MySQL.prototype.queries = function (objQuery, cb) {
  objQuery = getDefaultValues(objQuery, this.config);
  runQuery(this, objQuery.query, objQuery.data, objQuery.timeout, objQuery.transactionID, cb);
};

MySQL.prototype.destroy = function (cbMain) {
  if (!pool) {
    return cbMain();
  }
  pool.end(function () {
    // all connections in the pool have ended
    return cbMain();
  });
};

function destroyTransactionClient(objMySQL, transactionID) {
  if (!transactionPool[transactionID]) {
    return;
  }
  var connection = transactionPool[transactionID];
  connection.release();
  delete transactionPool[transactionID];
}

function getDefaultValues(objQuery, dbConfig) {
  if (objQuery.transactionID === undefined) {
    objQuery.transactionID = false;
  }
  if (objQuery.timeout === undefined) {
    objQuery.timeout = dbConfig.queryTimeout;
  }
  return objQuery;
}

function runQuery(objMySQL, query, data, timeout, transactionID, cb) {
  var hadError = false;
  var clientObj = null;
  var response = [];
  var retryTransactionCnt = 0;

  if (transactionID) {
    // Called inside a transaction.
    clientObj = transactionPool[transactionID];
    if (!clientObj) {
      return cb(new AppError(new Error('No connection found for transaction.'),
        'Connection not found for transaction.', {
          transactionID: transactionID
        }));
    }
    runQueryWithClient();
  } else {
    // Get a connection to use.
    objMySQL.pool.getConnection(function (err, connection) {
      if (err) {
        return cb(new AppError(err, objMySQL.msgStrings['errorDbConn']), null);
      }
      clientObj = connection;
      runQueryWithClient();
    });
  }

  function runQueryWithClient() {
    try {
      if (!data || Array.isArray(data)) {
        clientObj.config.queryFormat = null;
      } else {
        clientObj.config.queryFormat = getCustomQueryFormat(data);
      }
      clientObj.query({
        sql: query,
        values: data,
        timeout: timeout
      }, handleResult);
    } catch (e) {
      if (transactionID) {
        // There was an error, if there was a transaction running, destroy it.
        destroyTransactionClient(objMySQL, transactionID);
      } else {
        clientObj.release();
      }
      cb(new AppError(e, objMySQL.msgStrings.queryExecution), {});
    }
  }

  /**
   * Called after a query has been executed properly to process the result from the query.
   */
  function handleResult(err, result) {
    if (err) {
      handleError(err);
    } else {
      // No error
      if (result.length !== 0) {
        response = result;
      }
      if (!transactionID) {
        clientObj.release();
      }
      return cb(null, response);
    }
  }

  /**
   * Called to handle error conditions, retries if its a deadlock and max retries haven't reached.
   */
  function handleError(err) {
    hadError = true;
    if (canRetry(err)) {
      ++retryTransactionCnt;
      logger.logDeadlockInfo('WARNING : Dead lock found. Retrying the transaction (Count : ' + retryTransactionCnt
        + ').\nSQLQuery : ' + query);
      runQueryWithClient();
    } else {
      if (retryTransactionCnt !== 0) {
        logger.logDeadlockInfo('\n\n>>=======================<<\nWARNING : Dead lock. Tried restarting - '
          + retryTransactionCnt + ' times. Giving up!'
          + '\nSQLQuery : ' + query + '>>=====<<\n\n');
      }
      retryTransactionCnt = 0;

      if (isFatalError(err)) {
        clientObj.destroy();
      } else {
        clientObj.release();
      }

      return cb(new AppError(err, objMySQL.msgStrings.queryExecution, {}));
    }
  }

  /**
   * Called to detect if the query can be tried again based if its a deadlock.
   */
  function canRetry(err) {
    if (err && err.hasOwnProperty('code')
      && err.code === 1282
      && retryTransactionCnt !== __CONFIG__.mariaDB.retryTransactionCnt) {
      return true;
    }
    return false;
  }
}

function isFatalError(err) {
  if (err && err.hasOwnProperty('fatal') && err.fatal === true) {
    return true;
  }
  return false;
}

function getCustomQueryFormat() {
  return function (query, values) {
    if (!values) {
      return query;
    }
    return query.replace(/\:(\w+)/g, function (txt, key) {
      if (values.hasOwnProperty(key)) {
        return this.escape(values[key]);
      }
      return null;
    }.bind(this));
  };
}

/**
 * This method is used to set the type cast
 * to use custom call back.
 */
function fieldToString(field) {
  return field.string();
}

function getPool(dbConfig) {
  if (pool) {
    return pool;
  }
  pool = mysql.createPool(dbConfig);
  pool.on('connection', function (connection) {
    connection.config.typeCast = fieldToString;
  });
  return pool;
}

module.exports = MySQL;