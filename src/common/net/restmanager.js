/**
 * @fileoverview and wrapper around rest calls.
 */

goog.provide('remobid.common.net.RestManager');

goog.require('goog.crypt.base64');
goog.require('goog.json');
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
  // TODO add connection checks
  return this.available_;
};

/**
 * starts a request to delete data via the rest api.
 * @param {string} url the url to the data.
 * @param {string} version version of the rest api.
 * @param {function(boolean?, *)} callback the callback function, taking a
 *    boolean status and the fetched data.
 * @param {(string|number)=} id the id of the resource to delete. Use comma-
 *    separation to batch multiple deletes into one request.
 * @param {string=} opt_parameters optional parameter to add to the request as
 *    get parameters.
 * @param {object.<string, string>=} opt_headers optional headers to send with
 *    the request.
 * @return {goog.net.XhrManager.Request} The queued request object.
 */
remobid.common.net.RestManager.prototype.delete = function(
  url, version, callback, id, opt_parameters, opt_headers) {

  if (!goog.isString(url) ||
      !goog.isString(version) ||
      !goog.isFunction(callback) ||
      (!goog.isString(id) && !goog.isNumber(id)))
    throw new Error('invalid request parameters');

  return this.startRequest_('DELETE', url, version, callback, id,
    opt_parameters, opt_headers);
};

/**
 * callback after a delete request. Checks Status code and calls the original
 * call back
 * @param {function(boolean?)} callback the callback function, as given
 *    to the delete method.
 * @param {goog.events.Event} event the original event fire by the xhrmanager.
 * @private
 */
remobid.common.net.RestManager.prototype.handleDelete_ = function(
  callback, event) {
  var XhrIo = /** @type {goog.net.XhrIo} */ event.target;
  if (XhrIo.getStatus() == '200' || XhrIo.getStatus() == '204')
    callback(false);
};

/**
 * starts a request to get data from the rest api.
 * @param {string} url the url to get the data from.
 * @param {string} version version of the rest api.
 * @param {function(boolean?, *)} callback the callback function, taking a
 *    boolean status and the fetched data.
 * @param {(string|number)=} opt_id the id of the resource or null if the fetch
 *    a collection. Use comma-separation to batch multiple ids into one
 *    request.
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

  return this.startRequest_('GET', url, version, callback, opt_id,
      opt_parameters, opt_headers);
};

/**
 * callback after a get request. Checks Status code and calls the original
 * call back
 * @param {function(boolean?, *)} callback the callback function, as given
 *    to the get method.
 * @param {goog.events.Event} event the original event fire by the xhrmanager.
 * @private
 */
remobid.common.net.RestManager.prototype.handleGet_ = function(
    callback, event) {
  var XhrIo = /** @type {goog.net.XhrIo} */ event.target;
  if (XhrIo.getStatus() == '200')
    callback(false, XhrIo.getResponseJson());
};

/**
 * @param {string} method the HTTP-Method to use with the request.
 * @param {string} url the url of the request.
 * @param {string} version version of the rest api.
 * @param {function(boolean?, *)} callback the callback function, taking a
 *    boolean status and the fetched data.
 * @param {(string|number)=} opt_id the id of the resource or null if the fetch
 *    a collection. Use comma-separation to batch multiple ids into one
 *    request.
 * @param {string=} opt_parameters optional parameter to add to the request as
 *    get parameters.
 * @param {object.<string, string>=} opt_headers optional headers to send with
 *    the request.
 * @return {goog.net.XhrManager.Request} The queued request object.
 * @private
 */
remobid.common.net.RestManager.prototype.startRequest_ = function(
  method, url, version, callback, opt_id, opt_parameters, opt_headers) {

  var restUrl = '/' + version + '/' + url;
  if (goog.isDefAndNotNull(opt_id))
    restUrl += '/' + opt_id;
  if (goog.isDefAndNotNull(opt_parameters))
    restUrl += opt_parameters;

  var headers = goog.object.clone(this.headers_);
  if (goog.isDefAndNotNull(opt_headers))
    goog.object.extend(headers, opt_headers);

  var requestId = method + ':' + restUrl + ':' + goog.json.serialize(headers);
  requestId = goog.crypt.base64.encodeString(requestId);

  // abort the request first, just to make sure there is no running request with
  // this url
  this.abort(requestId, true);

  return this.send(requestId,
    this.baseUrl_ + restUrl,
    method,
    undefined,
    headers,
    undefined,
    goog.bind(this.handleRequest_, this, method, callback));
};

/**
 * callback after a request. Checks Status code and calls the original
 * call back.
 * @param {string} method the method of the request.
 * @param {function(*, goog.net.XhrIo)} callback the callback function, as given
 *    to the original method.
 * @param {goog.events.Event} event the original event fire by the xhrmanager.
 * @private
 */
remobid.common.net.RestManager.prototype.handleRequest_ = function(
  method, callback, event) {
  // TODO handle some errors and redirects
  switch (method) {
    case 'GET':
      this.handleGet_(callback, event);
      break;
    case 'DELETE':
      this.handleDelete_(callback, event);
      break;
  }

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
