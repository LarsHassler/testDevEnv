/**
 * @fileoverview a cache to use with localstorage.
 */

goog.provide('remobid.common.cache.LocalCache');

goog.require('remobid.common.storage.LocalStorage');

/**
 *
 * @param {remobid.common.storage.StorageInterface=} opt_storage the storage
 *    engine to use for saving.
 * @constructor
 */
remobid.common.cache.LocalCache = function(opt_storage) {
  /**
   *
   * @type {?remobid.common.storage.StorageInterface}
   * @private
   */
  this.storage_ = null;

  if (opt_storage)
    this.setStorage(opt_storage);
};

/**
 * Sets the storage engine
 * @param {remobid.common.storage.StorageInterface=} storage the storage
 *    engine to use for saving.
 */
remobid.common.cache.LocalCache.prototype.setStorage = function(storage) {
  if (!(storage instanceof remobid.common.storage.LocalStorage))
    throw new Error('execpts only remobid.common.storage.LocalStorage');

  this.storage_ = storage;
};
