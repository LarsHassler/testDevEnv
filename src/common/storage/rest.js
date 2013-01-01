/**
 * @fileoverview a storage engine via REST calls.
 */

goog.provide('remobid.common.storage.Rest');

goog.require('remobid.common.net.RestManager');
goog.require('remobid.common.storage.StorageBase');
goog.require('remobid.common.storage.StorageErrorType');
goog.require('remobid.common.storage.storageBase.Options');


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
  if (goog.isDefAndNotNull(id) && !this.checkValidId(id, callback))
    return;

  if (goog.isArray(id)) {
    id = id.join(',');
  }

  this.restManager_.get(
    this.resourceId,
    this.version,
    callback,
    id,
    this.createParameterUriString(opt_option)
  );
};

/** @override */
remobid.common.storage.Rest.prototype.remove = function(
  callback, id, opt_option) {
  if (!this.checkValidId(id, callback))
    return;

  if (goog.isArray(id)) {
    id = id.join(',');
  }

  this.restManager_.delete(
    this.resourceId,
    this.version,
    callback,
    id,
    this.createParameterUriString(opt_option)
  );
};

/**
 * creates the parameter string to attach to the url.
 * @param {remobid.common.storage.storageBase.Options=} opt_option the options
 *    to create the string from.
 * @return {string?} the final uri parameter string or null if not applicable.
 */
remobid.common.storage.Rest.prototype.createParameterUriString = function(
    opt_option) {
  if (!goog.isDefAndNotNull(opt_option) || !goog.isObject(opt_option))
    return null;

  var string = '';

  if (goog.isDef(opt_option.fields))
    string += '&fields=' + opt_option.fields.join(',');

  if (goog.isNumber(opt_option.offset))
    string += '&offset=' + opt_option.offset;

  if (goog.isNumber(opt_option.limit))
    string += '&limit=' + opt_option.limit;

  return '?' + string.substr(1);
};
