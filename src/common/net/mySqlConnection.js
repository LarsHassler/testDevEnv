/**
 * @fileoverview a wrapper for accessing MySql databases.
 */

require('nclosure');
var mysql = require('mysql');


goog.provide('remobid.common.net.MySqlConnection');
goog.provide('remobid.common.net.mySqlConnection.Data');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('remobid.common.error.BaseError');
goog.require('remobid.common.storage.StorageErrorType');


/**
 * @param {Object.remobid.common.net.mySqlConnection.Data} connectionData
 * The data which is needed to connect to the database.
 * @constructor
 * @extends {goog.Disposable}
 */
remobid.common.net.MySqlConnection = function(connectionData) {

  /**
   * @type {Object.remobid.common.net.mySqlConnection.Data}
   * @private
   */
  this.connectionData_ = connectionData;

  this.connection = mysql.createConnection(this.connectionData_);

  this.connection.connect(goog.nullFunction);
};
goog.inherits(remobid.common.net.MySqlConnection, goog.Disposable);

/**
 * closes the connection
 */
remobid.common.net.MySqlConnection.prototype.disconnect = function() {
  this.connection.end();
};

/**
 * Starts the connection to the MySql data base.
 */
remobid.common.net.MySqlConnection.prototype.connect = function() {
  this.connection.connect(goog.nullFunction);
};

/**
 *
 * @param {function} callback Is called when data has been returned.
 * @param {string} sql The sql query.
 * @param {Array.<string|number>} opt_values
 *    The values to replace tags with. e.g. {{name}} would be replaced with
 *    {name:'Some Name'}.
 */
remobid.common.net.MySqlConnection.prototype.query =
    function(callback, sql, opt_values) {
  this.connection.query(sql, opt_values, callback);
};

/**
 *
 * @param {function} callback Is called when data has been deleted.
 * @param {string} table The tabe, we want to delet from.
 * @param {string} where
 *    Either the id (identified by the absence of a space)
 *    or the WHERE string (everything after 'WHERE'; has to start with a space).
 * @param {Array.<string|number>} opt_values
 *    The values to replace tags with. e.g. {{name}} would be replaced with
 *    {name:'Some Name'}.
 */
remobid.common.net.MySqlConnection.prototype.delete =
    function(callback, table, where, opt_values) {

  where = this.computeWhere(where, opt_values);

  var sql = 'DELETE FROM `' + table + '`' + where;
  this.connection.query(sql, opt_values, callback);
};

/**
 *
 * @param {function} callback
 *    Is called when the data has been inserted.
 * @param {string} table
 *    The Table, we want to insert into.
 * @param {object} data
 *    The data that will be inserted ({col : value}).
 */
remobid.common.net.MySqlConnection.prototype.insert =
    function(callback, table, data) {
  this.createQueryAndQueryDb(callback, 'INSERT INTO', table, data);
};

/**
 *
 * @param {function} callback
 *    Is called when the data has been updated.
 * @param {string} table
 *    The table whose entries will be updated.
 * @param {Object} data
 *    The data that will be updated.
 * @param {string} where
 *    Either the id (identified by the absence of a space)
 *    or the WHERE string (everything after 'WHERE'; has to start with a space).
 * @param {Array.<string|number>=} opt_values
 *    The values to replace tags with. e.g. {{name}} would be replaced with
 *    {name:'Some Name'}.
 */
remobid.common.net.MySqlConnection.prototype.update =
    function(callback, table, data, where, opt_values) {

  where = this.computeWhere(where, opt_values);

  this.createQueryAndQueryDb(callback, 'UPDATE', table, data, where);
};

/**
 *
 * @param {string} value The value that needs to be escaped.
 * @return {string} The escaped value.
 */
remobid.common.net.MySqlConnection.prototype.escape = function(value) {
  return this.connection.escape(value);
};

/**
 *
 * @param {function} callback
 *    Is called when the data has been updated.
 * @param {string} action
 *    The action that will be performed (e.g. UPDATE).
 * @param {string} table
 *    The affected table.
 * @param {object} data
 *    The data that will be added / updated.
 * @param {string=} opt_where
 *    The WHERE clause, needed for updates.
 */
remobid.common.net.MySqlConnection.prototype.createQueryAndQueryDb =
    function(callback, action, table, data, opt_where) {
  var dataString = '';
  if (!opt_where) opt_where = '';


  goog.object.forEach(data, function(value, key) {
    dataString += ', `' + key +
      '`=' + this.escape(value);
  }, this);

  dataString = dataString.substr(2); //remove first ', '


  var sql = action + ' `' + table + '`' + ' SET ' + dataString + opt_where;
  this.query(callback, sql, null);
};

/**
 * Temp function
 * @param {string} sql
 *    Temp.
 * @param {Object} values
 *    Temp.
 * @return {*} The parsed sql.
 */
remobid.common.net.MySqlConnection.prototype.parseSql = function(sql, values) {
  var notUsedTags = [];

  sql = sql.replace(/\{\{(\w+)\}\}/g, function(text, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    } else { //tag exists, but no value to replace it with
      goog.array.insert(notUsedTags, key);
    }

    return text;
  });

  if (goog.array.isEmpty(notUsedTags)) return sql;
  else throw new remobid.common.error.BaseError(
    remobid.common.storage.StorageErrorType.SUPERNUMEROUS_TAG);
};

/**
 *
 * @param {string} where
 *    The where part of the query, not containing a 'WHERE'.
 * @param {Array.<string|number>} opt_values
 *    The values to replace tags with. e.g. {{name}} would be replaced with
 *    {name:'Some Name'}.
 * @return {string} The computed string.
 */
remobid.common.net.MySqlConnection.prototype.computeWhere = function(
    where, opt_values) {
  if (goog.isDefAndNotNull(where)) {
    if (goog.isObject(opt_values)) {
      where = this.parseSql(where, opt_values);
    }

    where = ' WHERE ' + where;
  }
  else where = '';

  return where;
};

/**
 * @typedef {{host: string, user: string?, password: string, database:string}}
 **/
remobid.common.net.mySqlConnection.Data;
