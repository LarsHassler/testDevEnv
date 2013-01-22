/**
 * @fileoverview A base class for all data models on the server.
 */

require('nclosure');
goog.provide('remobid.common.model.ModelBaseServer');

goog.require('remobid.common.model.ModelBase');

/**
 *
 * @constructor
 * @extends remobid.common.model.ModelBase
 */
remobid.common.model.ModelBaseServer = function() {
  goog.base(this);

};
goog.inherits(remobid.common.model.ModelBaseServer,
  remobid.common.model.ModelBase);
