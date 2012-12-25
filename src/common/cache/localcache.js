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
  goog.base(this, version, resourceId);

  /**
   * time after which the cache should expire in ms.
   * @type {Number}
   * @private
   */
  this.expireTime_ = 60 * 60 * 1000;
};
goog.inherits(remobid.common.cache.LocalCache,
  remobid.common.storage.LocalStorage);

/**
 * @param {number} ms the new time to expire the cache in ms.
 */
remobid.common.cache.LocalCache.prototype.setExpireTime = function(ms) {
  this.expireTime_ = parseInt(ms, 10);
};

/**
 * stores the given data for the given id
 * @param {function(err)} callback the callback function which is called
 *    after the action is completed.
 * @param {string|number|Array.<string>|Array.<number>} id
 *    single id, set of ids.
 * @param {Object} data the data to store.
 * @param {boolean?} opt_retry if its already the retry.
 */
remobid.common.cache.LocalCache.prototype.store = function(callback, id, data,
    opt_retry) {
  goog.base(this, 'store', goog.bind(function(err) {
    // if quota exceeded clear expired and try again
    if (err) {
      if (!opt_retry) {
        this.clearExpired(goog.bind(function(err) {
          if (err) {
            callback(err);
            return;
          }

          // try again
          this.store(callback, id, data, true);
        }, this));
      }
      else callback(err);
      return;
    }

    this.storage_.setItem(this.createKey(id) + ':d', goog.now());
    callback(null);

  }, this), id, data);
};

/** @override */
remobid.common.cache.LocalCache.prototype.load = function(callback, id) {
  var key = this.createKey(id);
  var savedDate = this.storage_.getItem(key + ':d');

  // no date found => data is not in cache
  if (!savedDate) {
    callback(null, null);
    return;
  }

  // if the cache is expired remove the value
  if (savedDate < goog.now() - this.expireTime_) {
    this.remove(function(err) {
      callback(null, null);
    }, id);
  }
  else
    goog.base(this, 'load', callback, id);
};

/** @override */
remobid.common.cache.LocalCache.prototype.remove = function(callback, id) {
  var key = this.createKey(id);
  this.storage_.removeItem(key + ':d');
  goog.base(this, 'remove', callback, id);
};

/**
 * removes all expired values from the storage engine.
 * @param {function} callback the callback which will be called with an error
 *    or when the action is finished.
 */
remobid.common.cache.LocalCache.prototype.clearExpired = function(callback) {
  var reg = new RegExp(
    '^LC-' + this.version_ + '-' + this.url_ + '-([0-9a-zA-Z]*):d$');
  var storageSize = this.storage_.length;
  var i = 0;
  var matches;

  while (i < storageSize) {
    var key = this.storage_.key(i);
    if (matches = key.match(reg)) {
      this.remove(goog.bind(function() {
        storageSize = this.storage_.length;
        i--;
      }, this), matches[1]);
    }
    else
      i++;
  }
  callback(null);
};

/** @override */
remobid.common.cache.LocalCache.prototype.createKey = function(id) {
  return 'LC-' + this.version_ + '-' + this.url_ + '-' + id;
};
