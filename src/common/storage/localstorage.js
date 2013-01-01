/**
 * @fileoverview a html5 storage engine.
 */

goog.provide('remobid.common.storage.LocalStorage');
goog.provide('remobid.common.storage.LocalStorage.DataType');

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.object');
goog.require('remobid.common.storage.StorageBase');
goog.require('remobid.common.storage.StorageErrorType');

/**
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @constructor
 * @extends {remobid.common.storage.StorageBase}
 */
remobid.common.storage.LocalStorage = function(version, resourceId) {
  goog.base(this, version, resourceId);

  /** @preserveTry */
  try {
    /**
     * @type {Storage}
     * @private
     */
    this.storage_ = window.localStorage;
  } catch (e) {
    /**
     * reference to window.localStorage
     * @type {Storage?}
     * @private
     */
    this.storage_ = null;
  }
};
goog.inherits(remobid.common.storage.LocalStorage,
  remobid.common.storage.StorageBase);

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
remobid.common.storage.LocalStorage.prototype.save = function(
    callback, id, data) {
  // May throw an exception if storage quota is exceeded.
  try {
    if (!goog.isArray(id))
      id = [id];
    goog.array.forEach(id, function(key) {
      this.save_(key, data);
    }, this);
  } catch (e) {
    callback(true, {
      message: remobid.common.storage.StorageErrorType.QUOTA_EXCEEDED
    });
    return;
  }
  callback(null);
};


/**
 * saved data and the responding type into localstorage,
 *    supports number|string|Array|object.
 * @param {string|number} id the given id to save the data at.
 * @param {string|number|Array|Object} data the data to store.
 * @private
 */
remobid.common.storage.LocalStorage.prototype.save_ = function(id, data) {
  var key = this.createKey(id);
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

/**
 * gets data form localstorage for one given key and applies the given options
 * @param {string|number} id id of the resource.
 * @param {remobid.common.storage.storageBase.Options=} opt_option optional
 *    options which should be applied.
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @return {*} the filtered data.
 * @protected
 */
remobid.common.storage.LocalStorage.prototype.fetchData = function(
    id, opt_option, callback) {
  var key = this.createKey(id);
  var data = this.storage_.getItem(key);
  var type = this.storage_.getItem(key + ':t');

  if (type == remobid.common.storage.LocalStorage.DataType.NUMBER)
    data = parseInt(data, 10);
  else if (type == remobid.common.storage.LocalStorage.DataType.JSON)
    data = goog.json.parse(data);
  else if (type == remobid.common.storage.LocalStorage.DataType.DATE)
    data = new Date(parseInt(data, 10));

  if (opt_option) {
    if (opt_option.fields) {
      if (goog.isObject(data)) {
        data = goog.object.filter(data, function(element, index) {
          return goog.array.contains(opt_option.fields, index);
        });
      } else {
        var m = remobid.common.storage.StorageErrorType.LOAD_OPTIONS_FIELDS;
        throw new Error(m);
      }
    }
  }

  return data;
};


/** @override */
remobid.common.storage.LocalStorage.prototype.remove = function(callback, id) {
  if (!this.checkValidId(id, callback))
    return;

  if (!goog.isArray(id))
    id = [id];

  for (var i = 0, end = id.length; i < end; i++) {
    var key = this.createKey(id[i]);
    this.storage_.removeItem(key);
    this.storage_.removeItem(key + ':t');
  }


  callback(null);
};

/** @enum {string} */
remobid.common.storage.LocalStorage.DataType = {
  NUMBER: 'N',
  STRING: 'S',
  JSON: 'J',
  DATE: 'D'
};
