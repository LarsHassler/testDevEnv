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

/**
 * starts a request to get data from the rest api.
 * @param {string} url the url to get the data from.
 * @param {string} version version of the rest api.
 * @param {function(boolean?, *)} callback the callback function, taking a
 *    boolean status and the fetched data.
 * @param {(string|number)=} opt_id the id of the resource or null if the fetch
 *    a collection.
 * @param {string=} opt_parameters optional parameter to add to the request as
 *    get parameters.
 * @param {object.<string, string>=} opt_headers optional headers to send with
 *    the request.
 * @return {goog.net.XhrManager.Request} The queued request object.
 */
remobid.common.net.RestManager.prototype.get = function(
  url, version, callback, opt_id, opt_parameters, opt_headers) {

  if (!goog.isString(url) ||
      !goog.isString(version) ||
      !goog.isFunction(callback))
    throw new Error('invalid request parameters');

  var restUrl = '/' + version + '/' + url;
  if (goog.isDefAndNotNull(opt_id))
    restUrl += '/' + opt_id;
  if (goog.isDefAndNotNull(opt_parameters))
    restUrl += '/' + opt_parameters;

  // abort the request first, just to make sure there is no running request with
  // this url
  this.abort(restUrl, true);

  var headers = goog.object.clone(this.headers_);
  if (goog.isDefAndNotNull(opt_headers))
      goog.object.extend(headers, opt_headers);

  return this.send(restUrl,
    this.baseUrl_ + restUrl,
    'GET',
    undefined,
    headers,
    undefined,
    goog.bind(this.handleGet_, this, callback));
};

/**
 * callback after a get request. Checks Status code and calls the original
 * call back
 * @param {function(*, goog.net.XhrIo)} callback the callback function, as given
 *    to the get method.
 * @param {goog.events.Event} event the original event fire by the xhrmanager.
 * @private
 */
remobid.common.net.RestManager.prototype.handleGet_ = function(
    callback, event) {
  var XhrIo = /** @type {goog.net.XhrIo} */ event.target;
  if (XhrIo.getStatus() == '200')
    callback(XhrIo.getResponseJson(), XhrIo);
  // TODO handle redirects
};


/* ######## static function */

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
