/**
 * @fileoverview a cache to use with localstorage.
 */

goog.provide('remobid.common.cache.LocalCache');

goog.require('remobid.common.storage.LocalStorage');

/**
 *
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @extends {remobid.common.storage.LocalStorage}
 * @constructor
 */
remobid.common.cache.LocalCache = function(version, resourceId) {
  goog.base(version, resourceId);

  /**
   * time after which the cache should expire in ms.
   * @type {Number}
   * @private
   */
  this.expireTime_ = 60 * 60 * 1000;
};
goog.inherits(remobid.common.cache.LocalCache,
  remobid.common.storage.LocalStorage);

/** @override */
remobid.common.cache.LocalCache.prototype.store = function(callback, id, data) {
  goog.base(this, 'store', goog.bind(function(err) {
    if (err)
       callback(err);

    this.storage_.setItem(this.createKey_(id) + ':d', goog.now());
    callback(null);

  }, this), id, data);
};

/** @override */
remobid.common.cache.LocalCache.prototype.load = function(callback, id) {
  var key = this.createKey_(id);
  var savedDate = this.storage_.getItem(key + ':d');
  // no date found => data is not in cache
  if (!savedDate) {
    callback(null, null);
    return;
  }

  // cache expired so remove the value
  if (savedDate < goog.now() - this.expireTime_) {
    this.storage_.removeItem(key + ':d');
    this.remove(function(err) {
      callback(null, null);
    }, id);
  }
  else
    goog.base(this, 'load', callback, id);
};

