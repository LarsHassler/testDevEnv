/**
 * Created with JetBrains WebStorm.
 * User: lhassler2
 * Date: 18.12.12
 * Time: 11:07
 * To change this template use File | Settings | File Templates.
 */

goog.provide('remobid.Model');

goog.require('goog.events.EventTarget');

/**
 *
 * @param {string=} opt_name optinal name for the model.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
remobid.Model = function(opt_name) {
  /**
   * the given name of the model
   * @type {string}
   * @private
   */
  this.name_ = opt_name || 'test';
};
goog.inherits(remobid.Model, goog.events.EventTarget);

/**
 * @return {string} name of the model.
 */
remobid.Model.prototype.getName = function() {
  return this.name_;
};

/**
 * @param {string} name the new name.
 */
remobid.Model.prototype.setName = function(name) {
  this.name_ = name;
};

