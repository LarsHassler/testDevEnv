/**
 * @fileoverview and wrapper around rest calls.
 */

goog.provide('remobid.common.net.RestManager');

goog.require('goog.crypt.base64');
goog.require('goog.net.XhrManager');

/**
 * @param {string} baseUrl the base url to use with the restManager.
 * @constructor
 * @extends {goog.net.XhrManager}
 */
remobid.common.net.RestManager = function(baseUrl) {
  goog.base(this);

  /**
   * the base url to use with the restManager.
   * @type {string}
   * @private
   */
  this.baseUrl_ = baseUrl;

  /**
   * holds all global headers for this service rest.
   * @type {object.<string, string>?}
   * @private
   */
  this.headers_ = {};

  /**
   * stores the current state of the connection to the rest endpoint.
   * @type {boolean}
   * @private
   */
  this.available_ = false;
};
goog.inherits(remobid.common.net.RestManager, goog.net.XhrManager);

/** @override */
remobid.common.net.RestManager.prototype.dispose = function() {
  remobid.common.net.RestManager.instanceConnections_[this.baseUrl_]--;
  if (remobid.common.net.RestManager.instanceConnections_[this.baseUrl_] > 0) {
    return;
  }

  goog.base(this, 'dispose');
  delete remobid.common.net.RestManager.instances_[this.baseUrl_];
  delete remobid.common.net.RestManager.instanceConnections_[this.baseUrl_];
};

/**
 * adds header information for basic authentication
 * @param {string=} opt_username username for authentication.
 * @param {string=} opt_password password for authentication.
 */
remobid.common.net.RestManager.prototype.setBasicAuthentication = function(
  opt_username, opt_password) {
  var string2encode = opt_username + ':' + opt_password;
  this.headers_['Authorization'] =
      'Basic ' + goog.crypt.base64.encodeString(string2encode);
};

/**
 * adds header information for oAuth authentication with bearer token
 * @param {string} token the access token.
 */
remobid.common.net.RestManager.prototype.setBearerToken = function(token) {
  this.headers_['Authorization'] =
    'bearer ' + token;
};

/**
 * @return {boolean} the status of the connection to the rest endpoint.
 */
remobid.common.net.RestManager.prototype.isAvailable = function() {
  return this.available_;
};



// static

/**
 * holds all instances of the RestManager.
 * @type {object.<string, remobid.common.net.RestManager>?}
 * @private
 */
remobid.common.net.RestManager.instances_;

/**
 *
 * holds the ussage counter for each instance
 * @type {object.<string, number>?}
 * @private
 */
remobid.common.net.RestManager.instanceConnections_;

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

  if (!remobid.common.net.RestManager.instances_) {
    remobid.common.net.RestManager.instances_ = {};
    remobid.common.net.RestManager.instanceConnections_ = {};
  }


  if (!remobid.common.net.RestManager.instances_[baseUrl]) {
    remobid.common.net.RestManager.instances_[baseUrl] =
      new remobid.common.net.RestManager(baseUrl);
    remobid.common.net.RestManager.instanceConnections_[baseUrl] = 0;
  }

  remobid.common.net.RestManager.instanceConnections_[baseUrl]++;

  return remobid.common.net.RestManager.instances_[baseUrl];
};
