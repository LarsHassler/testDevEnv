/**
 * @fileoverview Implementation for a collecion of models used on the server.
 */

require('nclosure');
goog.provide('remobid.common.model.CollectionServer');

goog.require('remobid.common.model.Collection');

/**
 *
 * @constructor
 * @extends remobid.common.model.Collection
 */
remobid.common.model.CollectionServer = function() {
  goog.base(this);

};
goog.inherits(remobid.common.model.CollectionServer,
  remobid.common.model.Collection);

