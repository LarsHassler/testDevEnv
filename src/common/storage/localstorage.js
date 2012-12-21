/**
 * @fileoverview a html5 storage engine.
 */

goog.provide('remobid.common.storage.LocalStorage');

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
    if (!goog.isString(data))
      data = goog.json.serialize(data);
    goog.array.forEach(id, function(key) {
      this.storage_.setItem(this.createKey_(key), data);
    }, this);
    callback(null);
  } catch (e) {
    callback(true, e);
  }
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

  if (!opt_option) {

  }
  else if (opt_option.fields) {
    data = goog.json.parse(data);
    data = goog.object.filter(data, function(element, index) {
      return goog.array.contains(opt_option.fields, index);
    });
  }

  return data;
};


/** @override */
remobid.common.storage.LocalStorage.prototype.delete = function(callback, id) {
  if (!this.checkValidKey_(id))
    retrun;

  if (!goog.isArray(id))
    id = [id];

  for (var i = 0, end = id.length; i < end; i++)
    this.storage_.removeItem(this.createKey_(id[i]));

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

