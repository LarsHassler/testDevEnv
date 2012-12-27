/**
 * @fileoverview a storage engine via REST calls.
 */

goog.provide('remobid.common.storage.Rest');

goog.require('remobid.common.storage.StorageErrorType');
goog.require('remobid.common.storage.StorageInterface');

/**
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @constructor
 * @implements {remobid.common.storage.StorageInterface}
 */
remobid.common.storage.Rest = function(version, resourceId) {
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

  this.restManager_ = null;
  // remobid.common.net.RestManager.getInstance()
};

/** @override */
remobid.common.storage.Rest.prototype.isAvailable = function() {
  return this.restManager_.isAvailable();
};

/** @override */
remobid.common.storage.Rest.prototype.load = function(
    callback, id, opt_option) {
  if (!this.checkValidKey_(id, callback))
    return;
};
