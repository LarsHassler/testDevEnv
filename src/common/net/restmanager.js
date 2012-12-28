/**
 * @fileoverview and wrapper around rest calls.
 */

goog.provide('remobid.common.net.RestManager');

goog.require('goog.net.XhrManager');

/**
 * @param {string} baseUrl the base url to use with the restManager.
 * @constructor
 * @extends {goog.net.XhrManager}
 */
remobid.common.net.RestManager = function(baseUrl) {
  goog.base(this);

  this.baseUrl_ = baseUrl;
};
goog.inherits(remobid.common.net.RestManager, goog.net.XhrManager);

/** @override */
remobid.common.net.RestManager.prototype.dispose = function() {
  goog.base(this, 'dispose');
  delete remobid.common.net.RestManager.instances_[this.baseUrl_];
};

/**
 * holds all instances of the RestManager.
 * @type {object.<string, remobid.common.net.RestManager>?}
 * @private
 */
remobid.common.net.RestManager.instances_ = null;

/**
 * base url to use if no url was provided.
 * @type {string}
 * @private
 */
remobid.common.net.RestManager.defaultBase_ = 'https://api.remobid.com';

/**
 * gets a instance by its baseurl
 * @param {string=} opt_baseUrl the base url to use with the restManager. If not
 *    provide, it will use the {@code defaultBase_}.
 * @return {remobid.common.net.RestManager} the RestManager assigned to the
 *    given baseUrl.
 */
remobid.common.net.RestManager.getInstance = function(opt_baseUrl) {
  var baseUrl = opt_baseUrl || remobid.common.net.RestManager.defaultBase_;

  if (!remobid.common.net.RestManager.instances_)
    remobid.common.net.RestManager.instances_ = {};

  if (!remobid.common.net.RestManager.instances_[baseUrl])
    remobid.common.net.RestManager.instances_[baseUrl] =
      new remobid.common.net.RestManager(baseUrl);

  return remobid.common.net.RestManager.instances_[baseUrl];
};
