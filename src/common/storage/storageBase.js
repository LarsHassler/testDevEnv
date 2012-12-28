/**
 * @fileoverview Interface for all storage classes.
 */

goog.provide('remobid.common.storage.StorageBase');

goog.require('goog.Disposable');

/**
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @constructor
 * @extends {goog.Disposable}
 */
remobid.common.storage.StorageBase = function(version, resourceId) {
  /**
   * holds the version of the resource
   * @type {string}
   * @protected
   */
  this.version = version;
  /**
   * holds the identifier of the resource
   * @type {string}
   * @protected
   */
  this.resourceId = resourceId;
};
goog.inherits(remobid.common.storage.StorageBase, goog.Disposable);

/**
 * loads data for a given id, set of ids or by a filter
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @param {null|string|number|Array} id single id, set of ids or null for all
 *    entries - maybe filtered by the options.
 * @param {{offset: number?,
 *     limit: number?,
 *     fields: Array.<string>}=} opt_option a set of options like
 */
remobid.common.storage.StorageBase.prototype.load = function(
  callback, id, opt_option) {
  if (!this.checkValidId(id, callback))
    return;

  var results;
  // when applying the opt_option the fetchData may throw an error
  try {
    if (goog.isArray(id)) {
      results = this.fetchMultipleData(id, opt_option, callback);
    }
    else {
      results = this.fetchData(id, opt_option, callback);
    }
  } catch (e) {
    callback(true, {message: e.message});
    return;
  }

  callback(null, results);
};

/**
 * gets data for multiple ids. This should be overwritten by the subclass
 * @param {Array} ids ids of the resources.
 * @param {Object} opt_option optional options which should be applied.
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @return {Array} the loaded data.
 * @protected
 */
remobid.common.storage.StorageBase.prototype.fetchMultipleData = function(
  ids, opt_option, callback) {
  var results = [];
  for (var i = 0, end = ids.length; i < end; i++) {
    var data = this.fetchData(ids[i], opt_option, callback);
    results.push(data);
  }
  return results;
};

/**
 * gets data. This should be overwritten by the subclass
 * @param {string|number} id id of the resource.
 * @param {Object} opt_option optional options which should be applied.
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @return {*} the filtered data.
 * @protected
 */
remobid.common.storage.StorageBase.prototype.fetchData = function(
  id, opt_option, callback) {

  return null;
};

/**
 * checks for wrong input. The actual saving will be done in {@code save}.
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @param {string|number|Array.<string>|Array.<number>} id
 *    single id, set of ids.
 * @param {Object} data the data to store.
 */
remobid.common.storage.StorageBase.prototype.store = function(
  callback, id, data) {
  if (!this.checkValidId(id, callback))
    return;

  // check for missing data
  if (!data) {
    callback(
      true,
      {message: remobid.common.storage.StorageErrorType.MISSING_DATA}
    );
    return;
  }

  this.save(callback, id, data);
};

/**
 * stores the given data for the given id. Should be overwritten by the
 *    subclass.
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @param {string|number|Array.<string>|Array.<number>} id
 *    single id, set of ids.
 * @param {Object} data the data to store.
 */
remobid.common.storage.StorageBase.prototype.save = function(
  callback, id, data) {
};
/**
 * deletes a resource for the given id
 * @param {function(boolean?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @param {string|number|Array} id single id, set of ids.
 */
remobid.common.storage.StorageBase.prototype.remove = function(callback, id) {

};

/**
 * @return {boolean} whenever the storage engine is a available.
 */
remobid.common.storage.StorageBase.prototype.isAvailable = function() {
  return true;
};

/**
 * formats the id into a key using both version and url
 * @param {string|number} id the id of the resource.
 * @return {string} the associated key.
 * @protected
 */
remobid.common.storage.StorageBase.prototype.createKey = function(id) {
  return 'rb-' + this.version + '-' + this.resourceId + '-' + id;
};

/**
 * checks if a given id is valid
 * @param {string|number|Array.<string>|Array.<number>} id the id to check.
 * @param {function(boolean?,Object=)} errorcallback callback function to use if
 *    the id is not valid.
 * @return {boolean} whenever the id is valid or not.
 * @protected
 */
remobid.common.storage.StorageBase.prototype.checkValidId = function(
  id, errorcallback) {
  var validId = false;
  // check for acceptable id values
  if (goog.isString(id))
    validId = true;
  else if (goog.isNumber(id))
    validId = true;
  else if (goog.isArray(id)) {
    validId = true;
    // check every single id to be either string or number
    for (var i = 0, end = id.length; i < end; i++) {
      if (!goog.isString(id[i]) && !goog.isNumber(id[i])) {
        validId = false;
        // we found the first invalid id so we can stop here
        break;
      }
    }
  }

  // if the id is not valid call the callback function with the error message
  if (!validId && errorcallback) {
    errorcallback(
      true,
      {message: remobid.common.storage.StorageErrorType.INVALID_KEY}
    );
  }

  // we return the status, so the function which called checkValid can also
  // abort it self.
  return validId;
};
