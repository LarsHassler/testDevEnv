/**
 * @fileoverview a html5 storage engine.
 */

goog.provide('remobid.common.storage.LocalStorage');
goog.provide('remobid.common.storage.LocalStorage.DataType');

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.object');
goog.require('remobid.common.storage.StorageErrorType');
goog.require('remobid.common.storage.StorageInterface');

/**
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @constructor
 * @implements {remobid.common.storage.StorageInterface}
 */
remobid.common.storage.LocalStorage = function(version, resourceId) {
  /**
   * reference to window.localStorage
   * @type {localStorage?}
   * @private
   */
  this.storage_ = null;
  /**
   * holds the version of the resource
   * @type {string}
   * @private
   */
  this.version_ = version;
  /**
   * holds the identifier of the resource
   * @type {string}
   * @private
   */
  this.url_ = resourceId;
  /** @preserveTry */
  try {
    /**
     * @type {Storage}
     * @private
     */
    this.storage_ = window.localStorage;
  } catch (e) {}
};

/** @override */
remobid.common.storage.LocalStorage.prototype.isAvailable = function() {
  /** @preserveTry */
  try {
    // May throw a security exception if web storage is disabled.
    return !!this.storage_ && !!this.storage_.getItem;
  } catch (e) {}
  return false;
};

/** @override */
remobid.common.storage.LocalStorage.prototype.store = function(
    callback, id, data) {

  if (!this.checkValidKey_(id, callback))
    return;

  // check for missing data
  if (!data) {
    callback(
      true,
      {
        message: remobid.common.storage.StorageErrorType.MISSING_DATA
      }
    );
    return;
  }
  // May throw an exception if storage quota is exceeded.
  try {
    if (!goog.isArray(id))
      id = [id];
    goog.array.forEach(id, function(key) {
      this.save_(key, data);
    }, this);
  } catch (e) {
    callback(true, e);
  }
  callback(null);
};


/**
 * saved data and the responding type into localstorage,
 *    supports number|string|Array|object.
 * @param {string|number} id the given id to save the data at.
 * @param {string|number|array|object} data the data to store.
 * @private
 */
remobid.common.storage.LocalStorage.prototype.save_ = function(id, data) {
  var key = this.createKey_(id);
  var type = remobid.common.storage.LocalStorage.DataType.STRING;
  if (goog.isNumber(data)) {
    type = remobid.common.storage.LocalStorage.DataType.NUMBER;
    data = '' + data;
  }
  if (goog.isDateLike(data)) {
    type = remobid.common.storage.LocalStorage.DataType.DATE;
    data = '' + data.valueOf();
  }

  if (!goog.isString(data)) {
    type = remobid.common.storage.LocalStorage.DataType.JSON;
    data = goog.json.serialize(data);
  }
  this.storage_.setItem(key + ':t', type);
  this.storage_.setItem(key, data);
};

/** @override */
remobid.common.storage.LocalStorage.prototype.load = function(
    callback, id, opt_option) {
  if (!this.checkValidKey_(id, callback))
    return;

  /** @type {string|Array.<string>} */
  var results;
  if (goog.isArray(id)) {
    results = [];
    for (var i = 0, end = id.length; i < end; i++) {
      var data = this.fetchData_(id[i], opt_option);
      results.push(data);
    }
  }
  else {
    var results = this.fetchData_(id, opt_option);
  }

  callback(null, results);
};

/**
 * gets data form localstorage for one given key and applies the given options
 * @param {string|number} id id of the resource.
 * @param {object} opt_option optional options which should be applied.
 * @return {string|object} the filtered data.
 * @private
 */
remobid.common.storage.LocalStorage.prototype.fetchData_ = function(
    id, opt_option) {
  var key = this.createKey_(id);
  var data = this.storage_.getItem(key);
  var type = this.storage_.getItem(key + ':t');

  if (type == remobid.common.storage.LocalStorage.DataType.NUMBER)
    data = parseInt(data, 10);
  else if (type == remobid.common.storage.LocalStorage.DataType.JSON)
    data = goog.json.parse(data);
  else if (type == remobid.common.storage.LocalStorage.DataType.DATE)
    data = new Date(parseInt(data, 10));

  if (!opt_option) {

  }
  else if (opt_option.fields) {
    data = goog.object.filter(data, function(element, index) {
      return goog.array.contains(opt_option.fields, index);
    });
  }

  return data;
};


/** @override */
remobid.common.storage.LocalStorage.prototype.remove = function(callback, id) {
  if (!this.checkValidKey_(id))
    return;

  if (!goog.isArray(id))
    id = [id];

  for (var i = 0, end = id.length; i < end; i++) {
    var key = this.createKey_(id[i]);
    this.storage_.removeItem(key);
    this.storage_.removeItem(key + ':t');
  }


  callback(null);
};

/**
 * checks if a given key is valid
 * @param {string|number|Array.<string>|Array.<number>} key the key to check.
 * @param {function} errorcallback callback function to use if the key is not
 *    valid.
 * @return {Boolean} whenever the key is valid or not.
 * @private
 */
remobid.common.storage.LocalStorage.prototype.checkValidKey_ = function(
    key, errorcallback) {
  var validKey = false;
  // check for acceptable id values
  if (goog.isString(key))
    validKey = true;
  else if (goog.isNumber(key))
    validKey = true;
  else if (goog.isArray(key)) {
    validKey = true;
    for (var i = 0, end = key.length; i < end; i++) {
      if (!goog.isString(key[i]) && !goog.isNumber(key[i])) {
        validKey = false;
      }
    }
  }
  if (!validKey && errorcallback) {
    errorcallback(
      true,
      {
        message: remobid.common.storage.StorageErrorType.INVALID_KEY
      }
    );
  }
  return validKey;
};

/**
 * formats the id into a key using both version and url
 * @param {string|number} id the id of the resource.
 * @return {String} the associated key.
 * @private
 */
remobid.common.storage.LocalStorage.prototype.createKey_ = function(id) {
  return 'rb-' + this.version_ + '-' + this.url_ + '-' + id;
};



/** @enum {string} */
remobid.common.storage.LocalStorage.DataType = {
  NUMBER: 'N',
  STRING: 'S',
  JSON: 'J',
  DATE: 'D'
};