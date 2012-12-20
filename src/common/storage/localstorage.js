/**
 * @fileoverview a html5 storage engine.
 */

goog.provide('remobid.common.storage.LocalStorage');

goog.require('goog.array');
goog.require('goog.json');
goog.require('remobid.common.storage.StorageErrorType');
goog.require('remobid.common.storage.StorageInterface');

/**
 * @constructor
 * @implements {remobid.common.storage.StorageInterface}
 */
remobid.common.storage.LocalStorage = function() {
  this.storage_ = null;
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
      this.storage_.setItem(key, data);
    }, this);
    callback(null);
  } catch (e) {
    callback(true, e);
  }
};

/** @override */
remobid.common.storage.LocalStorage.prototype.load = function(
    callback, id, options) {
  if (!this.checkValidKey_(id, callback))
    return;

  /** @type {string|Array.<string>} */
  var results;
  if (goog.isArray(id)) {
    results = [];
    for (var i = 0, end = id.length; i < end; i++) {
      results.push(this.storage_.getItem(id[i]));
    }
  }
  else
    results = this.storage_.getItem(id);

  callback(null, results);
};

/** @override */
remobid.common.storage.LocalStorage.prototype.delete = function(callback, id) {
  if (!this.checkValidKey_(id))
    retrun;

  if (!goog.isArray(id))
    id = [id];

  for (var i = 0, end = id.length; i < end; i++)
    this.storage_.removeItem(id[i]);

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
