/**
 * @fileoverview a storage engine via REST calls.
 */

goog.provide('remobid.common.storage.Rest');

goog.require('remobid.common.net.RestManager');
goog.require('remobid.common.storage.StorageBase');
goog.require('remobid.common.storage.StorageErrorType');


/**
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @constructor
 * @extends {remobid.common.storage.StorageBase}
 */
remobid.common.storage.Rest = function(version, resourceId) {
  goog.base(this, version, resourceId);

  this.restManager_ = remobid.common.net.RestManager.getInstance();
};
goog.inherits(remobid.common.storage.Rest,
  remobid.common.storage.StorageBase);

/** @override */
remobid.common.storage.Rest.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  this.restManager_ = null;
};

/** @override */
remobid.common.storage.Rest.prototype.isAvailable = function() {
  return this.restManager_.isAvailable();
};

/** @override */
remobid.common.storage.Rest.prototype.load = function(
    callback, id, opt_option) {
  if (!this.checkValidId(id, callback))
    return;
};
