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
   * @type {number}
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

/** @override */
remobid.common.cache.LocalCache.prototype.save = function(callback, id, data,
    opt_retry) {
  goog.base(this, 'save', goog.bind(function(err, returnData) {
    // if quota exceeded clear expired and try again
    if (err) {
      var errorType = remobid.common.storage.StorageErrorType.QUOTA_EXCEEDED;
      if (!opt_retry &&
          returnData.message == errorType) {
        this.clearExpired(goog.bind(function(err) {
          if (err) {
            callback(err);
            return;
          }

          // try again
          this.save(callback, id, data, true);
          return;
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
remobid.common.cache.LocalCache.prototype.load = function(
  callback, id, opt_option) {
  if (!this.checkValidId(id, callback))
    return;

  var results;
  try {
    if (goog.isArray(id)) {
      results = [];
      for (var i = 0, end = id.length; i < end; i++) {
        var data = this.fetchData(id[i], opt_option, callback);
        results.push(data);
      }
    }
    else {
      results = this.fetchData(id, opt_option, callback);
    }
  } catch (e) {
    callback(true, e);
    return;
  }

  callback(null, results);
};

/** @override */
remobid.common.cache.LocalCache.prototype.fetchData = function(
  id, opt_option, callback) {
  var key = this.createKey(id);
  var savedDate = this.storage_.getItem(key + ':d');

  // no date found => data is not in cache
  if (!savedDate) {
    return null;
  }

  // if the cache is expired remove the value
  if (parseInt(savedDate, 10) < goog.now() - this.expireTime_) {
    this.remove(goog.nullFunction, id);
    return null;
  }
  else {
    return goog.base(this, 'fetchData', id, opt_option);
  }
};

/** @override */
remobid.common.cache.LocalCache.prototype.remove = function(callback, id) {
  if (!this.checkValidId(id, callback))
    return;

  if (!goog.isArray(id))
    id = [id];

  for (var i = 0, end = id.length; i < end; i++) {
    var key = this.createKey(id[i]);
    this.storage_.removeItem(key + ':d');
  }

  goog.base(this, 'remove', callback, id);
};

/**
 * removes all expired values from the storage engine.
 * @param {function(boolean?)} callback the callback which will be called with
 *    an error or when the action is finished.
 */
remobid.common.cache.LocalCache.prototype.clearExpired = function(callback) {
  var reg = new RegExp(
    '^LC-([0-9a-zA-Z]*)-([0-9a-zA-Z]*)-([0-9a-zA-Z]*):d$');
  var storageSize = this.storage_.length,
    i = 0,
    entries = [];
  var matches;

  while (i < storageSize) {
    var key = '' + this.storage_.key(i);
    if (matches = key.match(reg)) {
      entries.push(matches[3]);
    }
    i++;
  }
  this.remove(goog.nullFunction, entries);
  callback(null);
};

/** @override */
remobid.common.cache.LocalCache.prototype.createKey = function(id) {
  return 'LC-' + this.version + '-' + this.resourceId + '-' + id;
};
