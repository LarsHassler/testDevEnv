/**
 * @fileoverview Implementation of the rest service.
 */

require('nclosure');
var restify = require('restify');

goog.provide('remobid.common.net.RestService');

goog.require('goog.Disposable');

/**
 *
 * @constructor
 * @extends goog.Disposable
 */
remobid.common.net.RestService = function() {
  goog.base(this);

  this.server_ = restify.createServer();
  this.server_.use(restify.queryParser());
  this.server_.get('/lots/:input', this.respond);
  this.server_.head('/lots/:input', this.respond);

  this.server_.listen(9000, goog.bind(function() {
    //console.log('%s listening at %s', this.server_.name, this.server_.url);
    console.log('%s listening at %s', this.name, this.url);
  }, this.server_));
};
goog.inherits(remobid.common.net.RestService,
  goog.Disposable);

/**
 *
 * @param {Object} req
 *    The request.
 * @param {Object} res
 *    The resource.
 * @param {Object} next
 *    Next.
 */
remobid.common.net.RestService.prototype.respond = function(req, res, next) {
  testOutput = {'firstName': 'Peter', 'secondName': 'Pan'};
  console.log(req.query);
  res.send('input: ' + req.params.input);
};

var x = new remobid.common.net.RestService();
