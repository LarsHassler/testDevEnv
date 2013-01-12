/**
 * @fileoverview a storage engine for MySql.
 */
require('nclosure');

goog.provide('remobid.common.storage.MySql');

goog.require('goog.array');
goog.require('goog.Disposable');
goog.require('goog.object');
goog.require('remobid.common.net.MySqlConnection');
goog.require('remobid.common.storage.Constant');
goog.require('remobid.common.storage.StorageInterface');


/**
 *
 * @param {Object.remobid.common.net.mySqlConnection.Data} connectionData
 *    The data which is needed to connect  to the database.
 * @param {Object.remobid.common.model.modelBase.Mapping} attributeMappings
 *    The attribute mapping.
 * @constructor
 * @implements {remobid.common.storage.StorageInterface}
 * @extends {goog.Disposable}
 */
remobid.common.storage.MySql = function(connectionData, attributeMappings) {

  /**
   * The data which is needed to connect to the database.
   * @type {Object.remobid.common.net.mySqlConnection.Data}
   */
  this.connectionData = connectionData;

  /**
   * The columns of the table.
   * They are extracted from the attributeMappings.
   * The name of the mapping is the column name.
   * @type {array}
   * @private
   */
  this.columns_ = [];
  /**
   * The data base that we are working on.
   * @type {Object.remobid.common.net.MySqlConnection}
   * @private
   */
  this.db_ = new remobid.common.net.MySqlConnection(this.connectionData);
  this.extractColumnsFromMapping_(attributeMappings);
};
goog.inherits(remobid.common.storage.MySql, goog.Disposable);

/**
 *
 * @param {Object.remobid.common.model.ModelBase.attributeMappings}
 *   attributeMappings
 *  The attribute mappings (we do only need the name = column).
 * @private
 */
remobid.common.storage.MySql.prototype.extractColumnsFromMapping_ = function(
  attributeMappings) {

    if (goog.isObject(attributeMappings)) {
      goog.object.forEach(attributeMappings, function(entry) {
        if (goog.isObject(entry) && goog.isDefAndNotNull(entry.name)) {
          goog.array.insert(this.columns_, entry.name);
        }
      }, this);
    }
};

/** @override */
remobid.common.storage.MySql.prototype.load = function(
  callback, resourceId, opt_id, opt_options) {

  this.checkValidCallback(callback);
  this.checkValidResourceId(resourceId);

  if (goog.isDefAndNotNull(opt_id)) {
    this.checkValidId(opt_id);
  }

  var where = this.computeWhere_(opt_id);

  var columns = '*';
  var limit = '';

  if (goog.isObject(opt_options)) {
    if (goog.isArray(opt_options.fields)) {
      columns = this.computeColumns_(opt_options.fields);
    }
    limit = this.computeLimit_(opt_options);
  }

  //this.db_.connect();
  var sql =
    'SELECT ' + columns + ' FROM `' + resourceId + '`' + where + limit;

  this.db_.query(
    callback,
    sql);

  //this.db_.disconnect();
};


/**
 * Checks if a given id is valid.
 * @param {string|number|Array.<string>|Array.<number>} id
 *  The id to check.
 * @return {boolean}
 *  Whether the id is valid or not.
 * @protected
 */
remobid.common.storage.MySql.prototype.checkValidId = function(id) {
  var validId = false;
  // check for acceptable id values
  if (goog.isString(id))
    validId = true;
  else if (goog.isNumber(id) && (id > 0 ||
      id == remobid.common.storage.Constant.NEW_ENTRY)) {
    validId = true;
  } else if (goog.isArray(id)) {
    if (0 != id.length)
    {
      validId = true;
      // check every single id to be either string or number
      for (var i = 0, end = id.length; i < end; i++) {
        if (!goog.isString(id[i]) && !(goog.isNumber(id[i]) && (id[i] > 0 ||
            id[i] == remobid.common.storage.Constant.NEW_ENTRY))) {
          validId = false;
          // we found the first invalid id so we can stop here
          break;
        }
      }
    }
  }

  // if the id is not valid call the callback function with the error message
  if (!validId) {
    throw new remobid.common.error.BaseError(
      remobid.common.storage.StorageErrorType.INVALID_KEY);
  }
};

/**
 * Checks if given data is valid.
 * @param {Object} data
 *    The data to check.
 * @protected
 */
remobid.common.storage.MySql.prototype.checkValidData = function(data) {
  if (!goog.isObject(data)) throw new remobid.common.error.BaseError(
    remobid.common.storage.StorageErrorType.INVALID_DATA);

  this.checkValidColumns(goog.object.getKeys(data));
};

/**
 * Checks if given columns do exist.
 * @param {Array.string} columns
 *    All columns, that are to be checked.
 * @protected
 */
remobid.common.storage.MySql.prototype.checkValidColumns = function(columns) {
  if (!goog.isArray(columns)) {
    throw new remobid.common.error.BaseError(
      remobid.common.storage.StorageErrorType.INVALID_DATA);
  } else if (0 == columns.length) {
    throw new remobid.common.error.BaseError(
      remobid.common.storage.StorageErrorType.INVALID_DATA);
  }

  goog.array.forEach(columns, function(column) {
    if (!goog.array.contains(this.columns_, column)) {
      throw new remobid.common.error.BaseError(
        remobid.common.storage.StorageErrorType.INVALID_FIELD);
    }
  }, this);
};

/**
 * Checks if gviven variable is a valid callback function.
 * @param {function} callback
 *    The callback varaible/function.
 */
remobid.common.storage.MySql.prototype.checkValidCallback = function(callback) {

  if (!goog.isFunction(callback)) {
    throw new remobid.common.error.BaseError(
      remobid.common.storage.StorageErrorType.INVALID_CALLBACK);
  }
};

/**
 *
 * @param {string} resourceId
 *    The id of the resource to check.
 */
remobid.common.storage.MySql.prototype.checkValidResourceId = function(
    resourceId) {

  if (!goog.isString(resourceId)) {
    throw new remobid.common.error.BaseError(
      remobid.common.storage.StorageErrorType.INVALID_RESOURCE);
  }
};

/** @override */
remobid.common.storage.MySql.prototype.store = function(
  callback, resourceId, id, data) {

  this.checkValidCallback(callback);
  this.checkValidResourceId(resourceId);
  this.checkValidId(id);
  this.checkValidData(data);

  if (remobid.common.storage.Constant.NEW_ENTRY == id) {
    id = this.getNewId();

    //goog.object.extend(data, {id:id}); //add the id to the insert data

    this.db_.insert(callback, resourceId, data);
  } else {
    var where = this.computeWhere_(id, false);
    this.db_.update(callback, resourceId, data, where);
  }
};

/** @override */
remobid.common.storage.MySql.prototype.remove = function(
    callback, resourceId, id) {

  this.checkValidCallback(callback);
  this.checkValidResourceId(resourceId);
  this.checkValidId(id);

  this.db_.delete(callback, resourceId, id);
};

/**
 *
 * @param {(string|number|Array.<string|number>)=} opt_id
 *    Either the id or an array of ids.
 * @param {boolean} opt_addWhere
 *    Add a ' WHERE ' in front of the query string?
 * @return {string} The computed WHERE condition.
 * @private
 */
remobid.common.storage.MySql.prototype.computeWhere_ = function(
  opt_id, opt_addWhere) {

  if (!goog.isDefAndNotNull(opt_addWhere)) opt_addWhere = true;
  if (goog.isDefAndNotNull(opt_id)) {

    var where;
    if (goog.isArray(opt_id)) {
      var idString = '';
      goog.array.forEach(opt_id, function(opt_id) {
        idString += ', ' + this.db_.escape(opt_id);
      }, this);
      idString = idString.substr(2); //remove first ', '

      where = '`id` IN (' + idString + ')';
    } else {
      where = '`id` = ' + this.db_.escape(opt_id);
    }

  } else {
    where = '1';
  }

  if (opt_addWhere) where = ' WHERE ' + where;

  return where;
};

/**
 *
 * @param {Array.string} fields
 *    Array with column names.
 * @return {String} The string used for the column part in a sql query.
 * @private
 */
remobid.common.storage.MySql.prototype.computeColumns_ = function(fields) {

  this.checkValidColumns(fields);
  //construct 'column string'
  var columns = '*';
  columns = '';
  goog.array.forEach(fields, function(field) {
    columns += ', `' + field + '`';
  }, this);
  columns = columns.substr(2); //remove first ', '
  return columns;
};

/**
 *
 * @param {remobid.common.storage.storageBase.Options=} options
 *    A set of options.
 *
 * @return {string} The limit part of the query string.
 * @private
 */
remobid.common.storage.MySql.prototype.computeLimit_ = function(options) {
  var offsetIsSet = false;
  var limitIsSet = false;
  var limit;
  if (goog.isDefAndNotNull(options.offset)) offsetIsSet = true;
  if (goog.isDefAndNotNull(options.limit)) limitIsSet = true;

  if (limitIsSet) {
    limit = ' LIMIT ' + options.limit;
    if (offsetIsSet) limit += ' OFFSET ' + options.offset;
  } else if (offsetIsSet) {
    //we need to use the biggest possible value, if there's no limit
    limit = ' LIMIT 18446744073709551610 OFFSET ' + options.offset;
  } else {
    limit = '';
  }
  return limit;
};

/** @override */
remobid.common.storage.MySql.prototype.isAvailable = function() {
  return true;
};

/**
 *
 */
remobid.common.storage.MySql.prototype.getNewId = function() {
  //return 4;
};
